const crypto = require('crypto');
const { getInstallationToken, getPRFiles, postPRReview, parseDiffForAI } = require('../services/githubService');
const { generateCodeHash } = require('../utils/codeHash');
const { getFromCache, saveToCache } = require('../services/cacheService');
const GithubReview = require('../models/GithubReview');
const GithubInstallation = require('../models/GithubInstallation');

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// ─── buildDiffPrompt ──────────────────────────────────────────────────────────
// Generates the AI prompt for reviewing a Git diff.
// The AI only sees the added/changed lines, pre-numbered.
const buildDiffPrompt = (fileSections) => {
  const codeBlock = fileSections.map(s => s.content).join('\n---\n');

  return `
You are an expert code reviewer. You are reviewing a GitHub Pull Request diff.

IMPORTANT RULES:
- Each line is prefixed with its line number in the actual file followed by "|" (e.g. "12| const x = 1;")
- ONLY review lines that appear in the diff (ignore context lines that haven't changed)
- Use the EXACT line number shown in the prefix for your issue reports
- Report issues per file using the filename shown in "### File:" headings

Return ONLY valid JSON in this format:
{
  "score": <number 0-100, overall quality of the changes>,
  "summary": "<one sentence summary of the PR changes and their quality>",
  "issues": [
    {
      "filename": "<exact filename from the ### File: heading>",
      "line": <the exact line number from the prefix>,
      "severity": "<critical|high|medium|low|info>",
      "category": "<security|performance|style>",
      "title": "<short title>",
      "description": "<what the problem is>",
      "suggestion": "<how to fix it>",
      "refactoredCode": "<fixed code snippet>"
    }
  ]
}

Severity guide:
- critical: Can be immediately exploited (SQL injection, exposed secrets, RCE)
- high: Serious flaw needing urgent attention
- medium: Should be fixed but not immediately dangerous
- low: Minor improvements
- info: Best practice suggestions

Pull Request diff to review:
${codeBlock}

Return ONLY valid JSON. No extra text.
`;
};

// ─── formatReviewComments ─────────────────────────────────────────────────────
// Converts AI issues into GitHub PR review comment objects.
// GitHub requires: { path, line, body, side: 'RIGHT' }
const formatReviewComments = (issues) => {
  const sevEmoji = {
    critical: '🚨',
    high: '🔴',
    medium: '🟡',
    low: '🟢',
    info: 'ℹ️',
  };

  return issues
    .filter(issue => issue.filename && issue.line)
    .map(issue => {
      const emoji = sevEmoji[issue.severity] || 'ℹ️';
      let body = `${emoji} **${issue.severity?.toUpperCase()} — ${issue.title}**\n\n`;
      body += `${issue.description}\n\n`;

      if (issue.suggestion) {
        body += `**💡 Suggestion:** ${issue.suggestion}\n\n`;
      }

      if (issue.refactoredCode) {
        body += `**⚡ Fix:**\n\`\`\`\n${issue.refactoredCode}\n\`\`\`\n`;
      }

      body += `\n*Reviewed by [SyntaxGuard](${clientUrl}) · Severity: \`${issue.severity}\` · Category: \`${issue.category}\`*`;

      return {
        path: issue.filename,
        line: issue.line,
        side: 'RIGHT',  // RIGHT = the new version of the file
        body,
      };
    });
};

// ─── buildSummaryComment ──────────────────────────────────────────────────────
const buildSummaryComment = (aiResult, filesReviewed) => {
  const score = aiResult.score || 0;
  const scoreBar = '█'.repeat(Math.round(score / 10)) + '░'.repeat(10 - Math.round(score / 10));
  const scoreEmoji = score >= 75 ? '✅' : score >= 50 ? '⚠️' : '🚨';

  const criticalCount = aiResult.issues?.filter(i => i.severity === 'critical').length || 0;
  const highCount     = aiResult.issues?.filter(i => i.severity === 'high').length || 0;
  const mediumCount   = aiResult.issues?.filter(i => i.severity === 'medium').length || 0;
  const lowCount      = aiResult.issues?.filter(i => ['low','info'].includes(i.severity)).length || 0;

  return `## 🤖 AI Code Review

${scoreEmoji} **Score: ${score}/100**  \`${scoreBar}\`

**${aiResult.summary || 'Review complete.'}**

| Severity | Count |
|----------|-------|
| 🚨 Critical | ${criticalCount} |
| 🔴 High | ${highCount} |
| 🟡 Medium | ${mediumCount} |
| 🟢 Low / Info | ${lowCount} |

**Files reviewed:** ${filesReviewed}

---
*Powered by [SyntaxGuard](${clientUrl}) using Groq LLaMA 3.3 70B*`;
};

// ─── handlePullRequestEvent ───────────────────────────────────────────────────
// The core orchestrator. Called when a PR is opened or updated (synchronize).
const handlePullRequestEvent = async (payload) => {
  const { action, pull_request: pr, repository: repo, installation } = payload;

  // Only react to opened or newly pushed commits
  if (!['opened', 'synchronize', 'reopened'].includes(action)) {
    console.log(`⏭️  Skipping PR action: ${action}`);
    return;
  }

  const owner      = repo.owner.login;
  const repoName   = repo.name;
  const prNumber   = pr.number;
  const commitSha  = pr.head.sha;
  const installId  = installation.id;

  console.log(`\n🔔 PR #${prNumber} ${action} on ${owner}/${repoName}`);

  try {
    // ── 1. Get installation access token ─────────────────────────────────
    console.log('🔑 Fetching installation token...');
    const token = await getInstallationToken(installId);

    // ── 2. Fetch the changed files ────────────────────────────────────────
    console.log('📄 Fetching PR files...');
    const prFiles = await getPRFiles(token, owner, repoName, prNumber);

    // Filter to only reviewable files (skip lockfiles, assets, etc.)
    const skipPatterns = /\.(lock|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)$|^(package-lock|yarn\.lock|pnpm-lock)/i;
    const reviewableFiles = prFiles.filter(f => f.patch && !skipPatterns.test(f.filename));

    if (reviewableFiles.length === 0) {
      console.log('⚠️  No reviewable code files found in this PR.');
      return;
    }

    // ── 3. Parse the diff for the AI ─────────────────────────────────────
    const fileSections = parseDiffForAI(reviewableFiles);
    const diffText = fileSections.map(s => s.content).join('\n');

    // ── 4. Check cache (key = hash of the diff, not just the code) ────────
    const cacheKey = generateCodeHash(diffText);
    const cached = await getFromCache(`pr_diff:${cacheKey}`);

    let aiResult;
    if (cached) {
      console.log('⚡ Cache hit — serving from Redis');
      aiResult = cached;
    } else {
      // ── 5. Call Groq AI ───────────────────────────────────────────────
      console.log('🤖 Calling Groq AI...');
      const Groq = require('groq-sdk');
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      const prompt = buildDiffPrompt(fileSections);
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      aiResult = JSON.parse(responseText);

      // Cache this result for 24 hours (same PR commit won't be re-analyzed)
      await saveToCache(`pr_diff:${cacheKey}`, aiResult);
      console.log(`✅ AI analysis complete. Score: ${aiResult.score}`);
    }

    // ── 6. Format comments ────────────────────────────────────────────────
    const comments = formatReviewComments(aiResult.issues || []);
    const summaryBody = buildSummaryComment(aiResult, reviewableFiles.length);

    console.log(`💬 Posting ${comments.length} inline comments to PR #${prNumber}...`);

    // ── 7. Post review to GitHub ──────────────────────────────────────────
    await postPRReview(token, owner, repoName, prNumber, commitSha, summaryBody, comments);

    console.log(`🎉 Review posted successfully to ${owner}/${repoName}#${prNumber}`);

    // ── 8. Save review to Database for Dashboard ──────────────────────────
    const installationDoc = await GithubInstallation.findOne({ installationId: installId });
    if (installationDoc) {
      await GithubReview.create({
        userId: installationDoc.userId,
        repositoryName: `${owner}/${repoName}`,
        pullRequestNumber: prNumber,
        pullRequestTitle: pr.title || `PR #${prNumber}`,
        pullRequestUrl: pr.html_url,
        score: aiResult.score || 0,
        summary: aiResult.summary || 'Review complete.',
        issues: aiResult.issues || [],
      });
      console.log(`💾 Saved review to database for user ${installationDoc.userId}`);
    }

  } catch (err) {
    console.error('❌ Error processing PR webhook:', err.message);
    // Don't throw — we already sent 200 to GitHub, this runs async
  }
};

// ─── handleGithubWebhook ──────────────────────────────────────────────────────
// Express handler for POST /api/webhooks/github
// 1. Verifies the webhook signature from GitHub
// 2. Responds 200 immediately (GitHub requires fast response)
// 3. Processes the event asynchronously
const handleGithubWebhook = (req, res) => {
  // ── Signature verification ────────────────────────────────────────────────
  const signature = req.headers['x-hub-signature-256'];
  const secret    = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) {
    console.error('❌ GITHUB_WEBHOOK_SECRET not set');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  if (!signature) {
    return res.status(401).json({ error: 'Missing webhook signature' });
  }

  if (!req.rawBody) {
    console.error('❌ Webhook error: Missing rawBody (ensure raw body parsing is active)');
    return res.status(400).json({ error: 'Missing rawBody' });
  }

  // req.rawBody is attached by the raw body middleware in server.js
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(req.rawBody)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    console.warn('⚠️  Invalid webhook signature — possible forgery attempt');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // ── Respond immediately so GitHub doesn't timeout ─────────────────────────
  res.status(200).json({ received: true });

  // ── Route event to correct handler ────────────────────────────────────────
  const event = req.headers['x-github-event'];
  const payload = req.body;

  if (event === 'pull_request') {
    // Fire and forget — runs in background
    handlePullRequestEvent(payload).catch(console.error);
  } else if (event === 'ping') {
    console.log('🏓 GitHub ping received — webhook is connected!');
  } else {
    console.log(`📨 Received GitHub event: ${event} (not handled)`);
  }
};

module.exports = { handleGithubWebhook };

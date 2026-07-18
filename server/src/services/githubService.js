const crypto = require('crypto');
const https = require('https');

/**
 * githubService.js
 *
 * All GitHub API interactions live here.
 * Handles:
 *   1. Creating a JWT signed with our GitHub App private key
 *   2. Exchanging that JWT for a short-lived installation access token
 *   3. Fetching the list of changed files (diff) from a Pull Request
 *   4. Posting an inline review with comments back to the PR
 */

// ─── Step 1: Build a JWT ───────────────────────────────────────────────────────
// GitHub Apps authenticate using RS256 JWTs signed with the private key
// that was generated when we registered the GitHub App.
// The JWT is only valid for 10 minutes — just long enough to exchange for an
// installation access token.
const createJWT = () => {
  const appId = process.env.GITHUB_APP_ID;
  // The private key is stored in .env as a single line with \n escaped.
  // We replace the literal "\n" strings with real newlines.
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n');

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60,          // issued 60s ago (clock skew tolerance)
    exp: now + (10 * 60),  // expires in 10 minutes
    iss: appId,             // issuer = our App ID
  };

  // Manual RS256 JWT (no external library needed)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const body   = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signingInput = `${header}.${body}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signingInput);
  const signature = sign.sign(privateKey, 'base64url');

  return `${signingInput}.${signature}`;
};

// ─── Step 2: Get Installation Access Token ─────────────────────────────────────
// Exchange our JWT for a short-lived token (valid 1 hour) scoped to
// a specific installation. This token is what we use to call GitHub API
// on behalf of a user's repository.
const getInstallationToken = async (installationId) => {
  const jwt = createJWT();

  const data = await githubRequest(
    `POST /app/installations/${installationId}/access_tokens`,
    jwt,
    null,
    'jwt'  // tell helper to use Bearer (JWT), not token
  );

  return data.token; // e.g. "ghs_16C7e42F292c6912E7710c838347Ae178B4a"
};

// ─── Step 3: Fetch Changed Files from a PR ────────────────────────────────────
// Returns array of: { filename, patch, status }
// `patch` is the raw git diff for that file.
const getPRFiles = async (token, owner, repo, prNumber) => {
  const files = await githubRequest(
    `GET /repos/${owner}/${repo}/pulls/${prNumber}/files`,
    token
  );
  return files;
};

// ─── Step 4: Post Inline Review Comments to PR ────────────────────────────────
// `comments` = array of { path, line, body }
// `summaryBody` = the overall review comment shown at the top
const postPRReview = async (token, owner, repo, prNumber, commitSha, summaryBody, comments) => {
  const body = {
    commit_id: commitSha,
    body: summaryBody,
    event: 'COMMENT',   // COMMENT = leave comments without approving/requesting changes
    comments: comments,
  };

  const result = await githubRequest(
    `POST /repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
    token,
    body
  );

  return result;
};

// ─── Helper: Generic GitHub API Request ───────────────────────────────────────
const githubRequest = (path, token, body = null, tokenType = 'token') => {
  return new Promise((resolve, reject) => {
    // Parse method and path from the path string e.g. "GET /repos/..."
    const [method, ...pathParts] = path.split(' ');
    const apiPath = pathParts.join(' ');

    const options = {
      hostname: 'api.github.com',
      path: apiPath,
      method: method,
      headers: {
        // GitHub requires this Accept header for the App API
        'Accept': 'application/vnd.github+json',
        'Authorization': tokenType === 'jwt' ? `Bearer ${token}` : `Bearer ${token}`,
        'User-Agent': 'AI-Code-Reviewer-App',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    };

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`GitHub API error ${res.statusCode}: ${JSON.stringify(parsed)}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          resolve(data); // some endpoints return empty body
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

// ─── Parse diff into code lines for AI ────────────────────────────────────────
// Extracts only the ADDED lines (+) from a git diff patch.
// Returns: { code: string, lineMap: { diffLineNum: fileLineNum } }
const parseDiffForAI = (files) => {
  const sections = [];

  for (const file of files) {
    if (!file.patch) continue; // binary files have no patch
    if (file.status === 'removed') continue; // skip deleted files

    const lines = file.patch.split('\n');
    let fileLineNum = 0;
    let fileSection = `\n### File: ${file.filename}\n`;

    for (const line of lines) {
      if (line.startsWith('@@')) {
        // Parse the new file starting line from the hunk header
        // Format: @@ -old_start,old_count +new_start,new_count @@
        const match = line.match(/\+(\d+)/);
        if (match) fileLineNum = parseInt(match[1]) - 1;
        continue;
      }

      if (line.startsWith('-')) continue; // skip removed lines

      fileLineNum++;
      if (line.startsWith('+')) {
        // This is a newly added line — include it with its real file line number
        fileSection += `${fileLineNum}| ${line.slice(1)}\n`;
      } else {
        // Unchanged context line — include for AI context but mark it
        fileSection += `${fileLineNum}| ${line}\n`;
      }
    }

    sections.push({ filename: file.filename, content: fileSection });
  }

  return sections;
};

module.exports = { getInstallationToken, getPRFiles, postPRReview, parseDiffForAI };

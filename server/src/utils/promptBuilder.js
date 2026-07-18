/**
 * Builds structured prompts for Groq LLaMA to analyze code.
 * Line numbers MUST be counted from line 1 of the file, including blank lines and comments.
 */

const buildAnalysisPrompt = (code, language) => {
  // Pre-number the code so the AI sees exact line references
  const numberedCode = code
    .split('\n')
    .map((line, i) => `${i + 1}| ${line}`)
    .join('\n');

  return `
You are an expert code reviewer specializing in ${language}. Analyze the following code and return a JSON response only — no markdown, no explanation outside the JSON.

IMPORTANT ABOUT LINE NUMBERS:
- Each line is prefixed with its line number followed by "|" (e.g. "5| const x = 1;").
- Use EXACTLY that line number in the "line" field. Do NOT re-count.
- Blank lines and comment lines count. Include them in your numbering.

Identify ALL issues related to:
1. SECURITY: SQL injection, XSS, hardcoded secrets, insecure dependencies, auth flaws
2. PERFORMANCE: O(n²) loops, memory leaks, redundant computations, unoptimized queries
3. STYLE: Naming conventions, code duplication, missing error handling, dead code

Return your response in this EXACT JSON format:
{
  "score": <number 0-100, overall code health>,
  "summary": "<one sentence overall summary>",
  "issues": [
    {
      "line": <the exact line number shown in the prefix>,
      "severity": "<critical|high|medium|low|info>",
      "category": "<security|performance|style>",
      "title": "<short title>",
      "description": "<detailed explanation of the problem>",
      "suggestion": "<how to fix it in plain english>",
      "refactoredCode": "<the corrected code snippet>"
    }
  ]
}

Severity guide:
- critical: Can be immediately exploited (e.g., SQL injection, exposed secrets)
- high: Serious flaw that needs urgent attention
- medium: Should be fixed but not immediately dangerous
- low: Minor improvements
- info: Suggestions and best practices

Code to analyze (${language}):
\`\`\`${language}
${numberedCode}
\`\`\`

Return ONLY valid JSON. No extra text.
`;
};

module.exports = { buildAnalysisPrompt };

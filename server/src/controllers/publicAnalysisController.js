const { generateCodeHash } = require('../utils/codeHash');
const { getFromCache, saveToCache } = require('../services/cacheService');
const { streamAnalyzeCode } = require('../services/aiService');

/**
 * Public streaming analysis — no auth required.
 * Used for demo/testing. Results are NOT saved to MongoDB.
 * POST /api/analysis/public-stream
 */
const publicStreamAnalysis = async (req, res, next) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ success: false, error: 'Code and language are required.' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const codeHash = generateCodeHash(code);

    // Check Redis cache first — even for public users
    const cached = await getFromCache(codeHash);
    if (cached) {
      res.write(`data: ${JSON.stringify({ done: true, servedFromCache: true, result: cached })}\n\n`);
      return res.end();
    }

    // Call Gemini AI with streaming
    const aiResult = await streamAnalyzeCode(code, language, res);

    // Cache the result for next time
    await saveToCache(codeHash, aiResult);

    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

module.exports = { publicStreamAnalysis };

const rateLimit = require('express-rate-limit');

/**
 * Token-bucket rate limiter using express-rate-limit.
 * Free plan: 100 requests per 15 minutes per IP.
 * This protects against API abuse and controls Gemini API costs.
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please wait before submitting again.',
    retryAfter: '15 minutes',
  },
});

/**
 * Stricter limiter for the AI analysis endpoint specifically.
 * Prevents a single user from hammering the expensive Gemini API.
 */
const analysisLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Max 5 analysis requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Analysis rate limit exceeded. You can submit up to 5 code reviews per minute.',
    retryAfter: '1 minute',
  },
});

module.exports = { apiLimiter, analysisLimiter };

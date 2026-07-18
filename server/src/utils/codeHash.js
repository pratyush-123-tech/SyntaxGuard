const crypto = require('crypto');

/**
 * Generates a SHA-256 hash of the submitted code.
 * This hash is used as the Redis cache key and stored in MongoDB
 * so we can instantly check if we've already analyzed this exact code.
 *
 * @param {string} code - The raw code string submitted by the user
 * @returns {string} - A 64-character hex hash
 */
const generateCodeHash = (code) => {
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
};

module.exports = { generateCodeHash };

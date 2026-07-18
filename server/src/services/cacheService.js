const { redis } = require('../config/redis');

const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24 hours

/**
 * Check if an analysis result exists in Redis cache.
 * @param {string} codeHash - SHA-256 hash of the submitted code
 * @returns {object|null} - Cached result or null on miss
 */
const getFromCache = async (codeHash) => {
  try {
    const cached = await redis.get(`analysis:${codeHash}`);
    return cached || null;
  } catch (error) {
    console.error('Redis GET error:', error.message);
    return null; // Graceful degradation
  }
};

/**
 * Save an analysis result to Redis cache.
 * @param {string} codeHash - SHA-256 hash of the submitted code
 * @param {object} data - The analysis result to cache
 */
const saveToCache = async (codeHash, data) => {
  try {
    await redis.set(`analysis:${codeHash}`, data, { ex: CACHE_TTL_SECONDS });
  } catch (error) {
    console.error('Redis SET error:', error.message);
    // Don't throw — caching failure shouldn't break the request
  }
};

module.exports = { getFromCache, saveToCache };

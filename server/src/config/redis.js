const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const testRedisConnection = async () => {
  try {
    await redis.set('ping', 'pong');
    const result = await redis.get('ping');
    if (result === 'pong') {
      console.log('✅ Upstash Redis Connected');
    }
  } catch (error) {
    console.error(`❌ Redis Connection Error: ${error.message}`);
    // Don't exit — app can still work without cache, just slower
  }
};

module.exports = { redis, testRedisConnection };

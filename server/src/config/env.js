const dotenv = require('dotenv');
dotenv.config();

const requiredEnvVars = [
  'MONGO_URI',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'GROQ_API_KEY',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log('✅ Environment variables validated');
};

module.exports = { validateEnv };

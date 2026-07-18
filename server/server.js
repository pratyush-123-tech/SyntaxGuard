require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { validateEnv } = require('./src/config/env');
const connectDB = require('./src/config/db');
const { testRedisConnection } = require('./src/config/redis');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const errorHandler = require('./src/middleware/errorHandler');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const analysisRoutes = require('./src/routes/analysisRoutes');
const repositoryRoutes = require('./src/routes/repositoryRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const publicAnalysisRoutes = require('./src/routes/publicAnalysisRoutes');
const webhookRoutes = require('./src/routes/webhookRoutes');
const githubRoutes = require('./src/routes/githubRoutes');
const userRoutes = require('./src/routes/userRoutes');

// ── Validate environment variables on startup ──────────────────
validateEnv();

const app = express();

// ── CRITICAL: Raw body capture for webhook signature verification ──────────
// GitHub signs webhooks with HMAC-SHA256 of the RAW request body.
app.use('/api/webhooks', express.raw({ type: 'application/json' }), (req, res, next) => {
  if (Buffer.isBuffer(req.body)) {
    req.rawBody = req.body;
    try {
      req.body = JSON.parse(req.body.toString());
    } catch (e) {
      req.body = {};
    }
  }
  next();
});

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '2mb' })); // Allow large code pastes
app.use(morgan('dev'));
app.use(apiLimiter); // Global rate limiting

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/public/analysis', publicAnalysisRoutes);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/user', userRoutes);

// ── Health Check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── 404 Handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found.` });
});

// ── Global Error Handler ───────────────────────────────────────
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await testRedisConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

start();

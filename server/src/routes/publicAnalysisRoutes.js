const express = require('express');
const router = express.Router();
const { publicStreamAnalysis } = require('../controllers/publicAnalysisController');
const { analysisLimiter } = require('../middleware/rateLimiter');

// Public route — no auth required, for demo purposes
router.post('/stream', analysisLimiter, publicStreamAnalysis);

module.exports = router;

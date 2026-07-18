const express = require('express');
const router = express.Router();
const { submitAnalysis, streamAnalysis, getAnalysisHistory, getAnalysisById, deleteAnalysis } = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');
const { analysisLimiter } = require('../middleware/rateLimiter');

router.use(protect); // All analysis routes require auth

router.post('/', analysisLimiter, submitAnalysis);
router.post('/stream', analysisLimiter, streamAnalysis);
router.get('/', getAnalysisHistory);
router.get('/:id', getAnalysisById);
router.delete('/:id', deleteAnalysis);

module.exports = router;

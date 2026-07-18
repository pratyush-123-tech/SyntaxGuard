const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { handleInstallCallback, getGithubStatus, disconnectGithub, saveInstallation, getGithubReviewHistory } = require('../controllers/githubAuthController');

/**
 * GET /api/github/callback
 * GitHub redirects here after a user installs the GitHub App.
 * Unprotected: we just redirect the browser back to the frontend with the ID.
 */
router.get('/callback', handleInstallCallback);

/**
 * POST /api/github/save-installation
 * The frontend calls this with the installationId it got from the URL.
 */
router.post('/save-installation', protect, saveInstallation);

/**
 * GET /api/github/status
 * Returns whether the logged-in user has connected their GitHub App.
 */
router.get('/status', protect, getGithubStatus);

/**
 * DELETE /api/github/disconnect
 * Removes the GitHub App installation record for the current user.
 */
router.delete('/disconnect', protect, disconnectGithub);

/**
 * GET /api/github/reviews
 * Returns all GitHub PR reviews saved for the current user.
 */
router.get('/reviews', protect, getGithubReviewHistory);

module.exports = router;

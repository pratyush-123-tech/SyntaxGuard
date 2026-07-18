const express = require('express');
const router = express.Router();
const { handleGithubWebhook } = require('../controllers/webhookController');

/**
 * POST /api/webhooks/github
 *
 * GitHub sends all events here.
 * IMPORTANT: This route must NOT use the JSON body parser — it needs the raw body
 * for signature verification. The raw body is attached in server.js before
 * this route is registered.
 */
router.post('/github', handleGithubWebhook);

module.exports = router;

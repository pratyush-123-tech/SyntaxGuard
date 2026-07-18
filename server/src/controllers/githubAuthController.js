const GithubInstallation = require('../models/GithubInstallation');

/**
 * GET /api/github/callback?installation_id=12345678&setup_action=install
 * GitHub redirects the user's browser here.
 * Since this is a browser redirect, we have no Bearer token. 
 * We just bounce the user back to the frontend with the ID in the URL.
 */
const handleInstallCallback = async (req, res) => {
  const { installation_id } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  
  if (!installation_id) {
    return res.redirect(`${clientUrl}/dashboard?github_error=missing_id`);
  }
  
  res.redirect(`${clientUrl}/dashboard?installation_id=${installation_id}`);
};

/**
 * POST /api/github/save-installation
 * The frontend (which HAS the Bearer token) calls this to save the ID.
 */
const saveInstallation = async (req, res) => {
  try {
    const { installationId } = req.body;
    const userId = req.user._id;

    await GithubInstallation.findOneAndUpdate(
      { userId },
      { installationId: parseInt(installationId) },
      { upsert: true, new: true }
    );

    console.log(`✅ GitHub App installed by user ${userId} — installation #${installationId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save GitHub installation:', error);
    res.status(500).json({ success: false, error: 'Failed to save GitHub installation' });
  }
};

/**
 * Returns whether the currently logged-in user has connected their GitHub App.
 * GET /api/github/status
 */
const getGithubStatus = async (req, res) => {
  try {
    const installation = await GithubInstallation.findOne({ userId: req.user._id });

    res.json({
      success: true,
      connected: !!installation,
      installationId: installation?.installationId || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch GitHub status' });
  }
};

const GithubReview = require('../models/GithubReview');

/**
 * Disconnects (removes) the GitHub App installation for the current user.
 * DELETE /api/github/disconnect
 */
const disconnectGithub = async (req, res) => {
  try {
    await GithubInstallation.findOneAndDelete({ userId: req.user._id });
    res.json({ success: true, message: 'GitHub disconnected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to disconnect GitHub' });
  }
};

/**
 * Returns all GitHub PR reviews saved for the current user.
 * GET /api/github/reviews
 */
const getGithubReviewHistory = async (req, res) => {
  try {
    const reviews = await GithubReview.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Failed to fetch github review history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch github review history' });
  }
};

module.exports = { handleInstallCallback, saveInstallation, getGithubStatus, disconnectGithub, getGithubReviewHistory };

const mongoose = require('mongoose');

/**
 * Stores the GitHub App installation linked to a user.
 * When a user installs our GitHub App on their repos,
 * GitHub gives us an `installationId`. We store it here
 * so we can use it to fetch tokens and call the GitHub API
 * on behalf of that user's repositories.
 */
const githubInstallationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one GitHub installation per user account
    },
    installationId: {
      type: Number,
      required: true,
    },
    // GitHub username / org that installed the app
    accountLogin: {
      type: String,
    },
    // 'User' or 'Organization'
    accountType: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GithubInstallation', githubInstallationSchema);

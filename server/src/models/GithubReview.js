const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  line: { type: Number, required: true },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    required: true,
  },
  category: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  suggestion: { type: String, required: true },
  refactoredCode: { type: String, default: '' },
});

const githubReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    repositoryName: {
      type: String,
      required: true, // e.g., "pratyush-123-tech/WanderLust"
    },
    pullRequestNumber: {
      type: Number,
      required: true,
    },
    pullRequestTitle: {
      type: String,
    },
    pullRequestUrl: {
      type: String,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    summary: {
      type: String,
    },
    issues: [issueSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('GithubReview', githubReviewSchema);

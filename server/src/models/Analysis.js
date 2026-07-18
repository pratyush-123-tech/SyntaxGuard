const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  line: { type: Number, required: true },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    required: true,
  },
  category: {
    type: String,
    enum: ['security', 'performance', 'style'],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  suggestion: { type: String, required: true },
  refactoredCode: { type: String, default: '' },
});

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      default: null,
    },
    codeHash: {
      type: String,
      required: true,
      index: true, // Fast lookups for cache checks
    },
    language: {
      type: String,
      required: true,
      lowercase: true,
    },
    originalCode: {
      type: String,
      required: true,
    },
    issues: [issueSchema],
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    servedFromCache: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analysis', analysisSchema);

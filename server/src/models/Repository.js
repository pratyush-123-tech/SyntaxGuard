const mongoose = require('mongoose');

const healthEntrySchema = new mongoose.Schema({
  score: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const repositorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Repository name is required'],
      trim: true,
    },
    url: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    analyses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Analysis',
      },
    ],
    healthHistory: [healthEntrySchema],
    lastAnalysedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Repository', repositorySchema);

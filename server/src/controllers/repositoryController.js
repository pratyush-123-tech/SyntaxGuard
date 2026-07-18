const Repository = require('../models/Repository');
const Analysis = require('../models/Analysis');
const AuditLog = require('../models/AuditLog');

// POST /api/repositories — Create a new repository
const createRepository = async (req, res, next) => {
  try {
    const { name, url, description } = req.body;
    const repo = await Repository.create({ userId: req.user._id, name, url, description });
    await AuditLog.create({ userId: req.user._id, action: 'repo_created', resourceType: 'repository', resourceId: repo._id });
    res.status(201).json({ success: true, data: repo });
  } catch (error) {
    next(error);
  }
};

// GET /api/repositories — Get all repos for a user
const getRepositories = async (req, res, next) => {
  try {
    const repos = await Repository.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, data: repos });
  } catch (error) {
    next(error);
  }
};

// GET /api/repositories/:id — Get single repo with full analysis history
const getRepositoryById = async (req, res, next) => {
  try {
    const repo = await Repository.findOne({ _id: req.params.id, userId: req.user._id }).populate('analyses', 'score language createdAt servedFromCache');
    if (!repo) return res.status(404).json({ success: false, error: 'Repository not found.' });
    res.json({ success: true, data: repo });
  } catch (error) {
    next(error);
  }
};

// PUT /api/repositories/:id — Rename a repo
const updateRepository = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, error: 'Name is required.' });
    const repo = await Repository.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name: name.trim() },
      { new: true }
    );
    if (!repo) return res.status(404).json({ success: false, error: 'Repository not found.' });
    res.json({ success: true, data: repo });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/repositories/:id — Delete a repo and all its analyses
const deleteRepository = async (req, res, next) => {
  try {
    const repo = await Repository.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!repo) return res.status(404).json({ success: false, error: 'Repository not found.' });
    // Cascade: remove all analyses belonging to this project
    await Analysis.deleteMany({ repositoryId: req.params.id });
    await AuditLog.create({ userId: req.user._id, action: 'repo_deleted', resourceType: 'repository', resourceId: req.params.id });
    res.json({ success: true, message: 'Repository and all its analyses deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRepository, getRepositories, getRepositoryById, updateRepository, deleteRepository };

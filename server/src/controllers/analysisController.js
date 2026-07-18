const Analysis = require('../models/Analysis');
const Repository = require('../models/Repository');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { generateCodeHash } = require('../utils/codeHash');
const { getFromCache, saveToCache } = require('../services/cacheService');
const { analyzeCode, streamAnalyzeCode } = require('../services/aiService');

// POST /api/analysis — Standard (non-streaming) analysis
const submitAnalysis = async (req, res, next) => {
  try {
    const { code, language, repositoryId } = req.body;
    const userId = req.user._id;

    if (!code || !language) {
      return res.status(400).json({ success: false, error: 'Code and language are required.' });
    }

    const codeHash = generateCodeHash(code);

    // ── Step 1: Check Redis Cache ──────────────────────────────
    const cached = await getFromCache(codeHash);
    if (cached) {
      await AuditLog.create({
        userId,
        action: 'code_submitted',
        resourceType: 'analysis',
        metadata: { cacheHit: true, language, latencyMs: 0 },
      });
      return res.json({ success: true, servedFromCache: true, data: cached });
    }

    // ── Step 2: Call Gemini AI ─────────────────────────────────
    const startTime = Date.now();
    const aiResult = await analyzeCode(code, language);
    const latencyMs = Date.now() - startTime;

    // ── Step 3: Save to MongoDB ────────────────────────────────
    const analysis = await Analysis.create({
      userId,
      repositoryId: repositoryId || null,
      codeHash,
      language,
      originalCode: code,
      issues: aiResult.issues || [],
      score: aiResult.score || 0,
      servedFromCache: false,
    });

    // ── Step 4: Update Repository health if linked ─────────────
    if (repositoryId) {
      await Repository.findByIdAndUpdate(repositoryId, {
        $push: {
          analyses: analysis._id,
          healthHistory: { score: aiResult.score, date: new Date() },
        },
        lastAnalysedAt: new Date(),
      });
    }

    // ── Step 5: Create notification ────────────────────────────
    const hasCritical = aiResult.issues?.some((i) => i.severity === 'critical');
    await Notification.create({
      userId,
      type: hasCritical ? 'critical_issue' : 'analysis_complete',
      title: hasCritical ? '🚨 Critical Issue Found' : '✅ Analysis Complete',
      message: hasCritical
        ? `A critical security issue was found in your ${language} code.`
        : `Your ${language} code scored ${aiResult.score}/100.`,
      analysisId: analysis._id,
    });

    // ── Step 6: Save to Redis Cache ────────────────────────────
    await saveToCache(codeHash, { ...aiResult, analysisId: analysis._id });

    // ── Step 7: Audit Log ──────────────────────────────────────
    await AuditLog.create({
      userId,
      action: 'code_submitted',
      resourceType: 'analysis',
      resourceId: analysis._id,
      metadata: { cacheHit: false, language, latencyMs },
    });

    res.status(201).json({ success: true, servedFromCache: false, data: { ...aiResult, analysisId: analysis._id } });
  } catch (error) {
    next(error);
  }
};

// POST /api/analysis/stream — Streaming analysis via Server-Sent Events
const streamAnalysis = async (req, res, next) => {
  try {
    const { code, language, repositoryId } = req.body;
    const userId = req.user._id;

    if (!code || !language) {
      return res.status(400).json({ success: false, error: 'Code and language are required.' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const codeHash = generateCodeHash(code);

    // Check cache first
    const cached = await getFromCache(codeHash);
    if (cached) {
      // Save to MongoDB even if from cache so user has history
      const analysis = await Analysis.create({
        userId,
        repositoryId: repositoryId || null,
        codeHash,
        language,
        originalCode: code,
        issues: cached.issues || [],
        score: cached.score || 0,
        servedFromCache: true,
      });

      if (repositoryId) {
        await Repository.findByIdAndUpdate(repositoryId, {
          $push: { analyses: analysis._id, healthHistory: { score: cached.score, date: new Date() } },
          lastAnalysedAt: new Date(),
        });
      }

      await AuditLog.create({
        userId,
        action: 'code_submitted',
        resourceType: 'analysis',
        resourceId: analysis._id,
        metadata: { cacheHit: true, language, streaming: true },
      });

      res.write(`data: ${JSON.stringify({ done: true, servedFromCache: true, result: cached })}\n\n`);
      return res.end();
    }

    const startTime = Date.now();
    const aiResult = await streamAnalyzeCode(code, language, res);
    const latencyMs = Date.now() - startTime;

    // Persist to MongoDB after streaming completes
    const analysis = await Analysis.create({
      userId,
      repositoryId: repositoryId || null,
      codeHash,
      language,
      originalCode: code,
      issues: aiResult.issues || [],
      score: aiResult.score || 0,
      servedFromCache: false,
    });

    if (repositoryId) {
      await Repository.findByIdAndUpdate(repositoryId, {
        $push: { analyses: analysis._id, healthHistory: { score: aiResult.score, date: new Date() } },
        lastAnalysedAt: new Date(),
      });
    }

    await Notification.create({
      userId,
      type: 'analysis_complete',
      title: '✅ Analysis Complete',
      message: `Your ${language} code scored ${aiResult.score}/100.`,
      analysisId: analysis._id,
    });

    await saveToCache(codeHash, { ...aiResult, analysisId: analysis._id });
    await AuditLog.create({
      userId,
      action: 'code_submitted',
      resourceType: 'analysis',
      resourceId: analysis._id,
      metadata: { cacheHit: false, language, latencyMs, streaming: true },
    });

    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

// GET /api/analysis — Get user's analysis history (paginated)
const getAnalysisHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      Analysis.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Analysis.countDocuments({ userId: req.user._id }),
    ]);

    res.json({
      success: true,
      data: analyses,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: skip + analyses.length < total },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analysis/:id — Get single analysis
const getAnalysisById = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user._id });
    if (!analysis) return res.status(404).json({ success: false, error: 'Analysis not found.' });

    await AuditLog.create({ userId: req.user._id, action: 'analysis_viewed', resourceType: 'analysis', resourceId: analysis._id });

    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/analysis/:id — Delete a single analysis
const deleteAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!analysis) return res.status(404).json({ success: false, error: 'Analysis not found.' });
    // Remove from parent repo's analyses array if linked
    if (analysis.repositoryId) {
      await Repository.findByIdAndUpdate(analysis.repositoryId, {
        $pull: { analyses: analysis._id },
      });
    }
    res.json({ success: true, message: 'Analysis deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitAnalysis, streamAnalysis, getAnalysisHistory, getAnalysisById, deleteAnalysis };

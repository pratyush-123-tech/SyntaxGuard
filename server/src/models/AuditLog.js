const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  action: {
    type: String,
    enum: [
      'code_submitted',
      'analysis_viewed',
      'repo_created',
      'repo_deleted',
      'login',
      'logout',
      'register',
      'token_refreshed',
    ],
    required: true,
  },
  resourceType: {
    type: String,
    enum: ['analysis', 'repository', 'user', 'session', 'system'],
    default: 'system',
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Flexible: { cacheHit: true, ip: "...", latencyMs: 250 }
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Auto-delete audit logs after 90 days to control DB size
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

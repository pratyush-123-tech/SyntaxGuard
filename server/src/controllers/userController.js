const User = require('../models/User');
const Analysis = require('../models/Analysis');
const Repository = require('../models/Repository');
const Session = require('../models/Session');
const AuditLog = require('../models/AuditLog');

// GET /api/user/profile — Get current user's profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/user/password — Change password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect.' });
    }

    user.passwordHash = newPassword;
    await user.save();

    await AuditLog.create({ userId: user._id, action: 'password_changed', resourceType: 'user', resourceId: user._id });
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/user/account — Permanently delete account and all data
const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ success: false, error: 'Password is required to delete your account.' });

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: 'Incorrect password.' });
    }

    const userId = user._id;

    // Delete all user data in parallel
    await Promise.all([
      Analysis.deleteMany({ userId }),
      Repository.deleteMany({ userId }),
      Session.deleteMany({ userId }),
      AuditLog.deleteMany({ userId }),
    ]);

    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'Account and all associated data have been permanently deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, changePassword, deleteAccount };

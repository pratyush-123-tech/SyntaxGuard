const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
const AuditLog = require('../models/AuditLog');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { accessToken, refreshToken };
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, passwordHash: password });

    await AuditLog.create({ userId: user._id, action: 'register', resourceType: 'user', resourceId: user._id });

    const { accessToken, refreshToken } = generateTokens(user._id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await Session.create({
      userId: user._id,
      refreshToken,
      deviceInfo: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip,
      expiresAt,
    });

    res.status(201).json({ success: true, accessToken, refreshToken, user });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    user.lastLoginAt = Date.now();
    await user.save();

    await AuditLog.create({ userId: user._id, action: 'login', resourceType: 'user', resourceId: user._id, metadata: { ip: req.ip } });

    const { accessToken, refreshToken } = generateTokens(user._id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await Session.create({
      userId: user._id,
      refreshToken,
      deviceInfo: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip,
      expiresAt,
    });

    res.json({ success: true, accessToken, refreshToken, user });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/refresh
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(401).json({ success: false, error: 'No refresh token.' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const session = await Session.findOne({ userId: decoded.id, refreshToken: token, isRevoked: false });
    if (!session) return res.status(401).json({ success: false, error: 'Invalid or revoked session.' });

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.id);
    session.refreshToken = newRefreshToken;
    await session.save();

    res.json({ success: true, accessToken });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    await Session.findOneAndUpdate({ refreshToken: token }, { isRevoked: true });
    await AuditLog.create({ userId: req.user?._id, action: 'logout', resourceType: 'session' });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, refreshToken, logout, getMe };

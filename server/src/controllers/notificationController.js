const Notification = require('../models/Notification');

// GET /api/notifications — Get all notifications for user
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/:id/read — Mark single notification as read
const markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true }
    );
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/read-all — Mark all notifications as read
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };

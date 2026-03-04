const asyncHandler = require('../utils/asyncHandler');
const notifQ = require('../queries/notification.queries');

// GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const notifications = await notifQ.findByUser(req.user.id, parseInt(page), parseInt(limit));
  res.json({ success: true, notifications });
});

// PUT /api/notifications/:notificationId/lire
const marquerCommeLue = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  await notifQ.markAsRead(notificationId, req.user.id);
  res.json({ success: true, message: 'Notification marquee comme lue' });
});

// GET /api/notifications/unread-count
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notifQ.countUnread(req.user.id);
  res.json({ success: true, count });
});

module.exports = { getNotifications, marquerCommeLue, getUnreadCount };

import { Notification } from '../models/Notification.js';

/**
 * Creates and optionally emits a notification via Socket.IO.
 * @param {object} io - Socket.IO server instance (optional)
 */
export async function createNotification(io, { recipient, type, title, message, link, relatedEntity, metadata }) {
  const notification = await Notification.create({
    recipient,
    type,
    title,
    message,
    link,
    relatedEntity,
    metadata,
  });

  // Emit real-time notification to the recipient's room
  if (io) {
    io.to(`user:${recipient}`).emit('notification:new', notification);
  }

  return notification;
}

export async function getNotifications(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
  const query = { recipient: userId };
  if (unreadOnly) query.isRead = false;

  const total = await Notification.countDocuments(query);
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

  return { notifications, total, page, pages: Math.ceil(total / limit), unreadCount };
}

export async function markRead(userId, notificationId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
}

export async function markAllRead(userId) {
  return Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
}

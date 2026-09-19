import { asyncHandler } from '../utils/asyncHandler.js';
import * as notificationService from '../services/notification.service.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, unreadOnly } = req.query;
  const result = await notificationService.getNotifications(req.user._id, {
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    unreadOnly: unreadOnly === 'true',
  });
  res.json({ success: true, data: result });
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markRead(req.user._id, req.params.id);
  res.json({ success: true, data: notification });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user._id);
  res.json({ success: true, data: { message: 'All notifications marked as read' } });
});

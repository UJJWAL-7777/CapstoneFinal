import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import * as badgeService from '../services/badge.service.js';

// Public — get any advocate's badges by their user ID (from URL :id)
export const getAdvocateBadges = asyncHandler(async (req, res) => {
  const userId = req.params.id || req.params.advocateId;
  if (!userId) throw ApiError.badRequest('Advocate ID required');
  const result = await badgeService.getAdvocateBadges(userId);
  res.json({ success: true, data: result });
});

// Protected — get the logged-in advocate's own badges
export const getMyBadges = asyncHandler(async (req, res) => {
  const result = await badgeService.getAdvocateBadges(req.user._id);
  res.json({ success: true, data: result });
});

// Public — get any advocate's achievements milestones by user ID
export const getAchievements = asyncHandler(async (req, res) => {
  const userId = req.params.id || req.params.advocateId;
  if (!userId) throw ApiError.badRequest('Advocate ID required');
  const achievements = await badgeService.getAchievements(userId);
  res.json({ success: true, data: achievements });
});

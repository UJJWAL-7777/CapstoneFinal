import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import * as badgeService from '../services/badge.service.js';
import { AdvocateProfile } from '../models/AdvocateProfile.js';

async function resolveAdvocateUserId(id) {
  if (!id) return null;
  const profile = await AdvocateProfile.findById(id).select('user');
  if (profile?.user) return String(profile.user);
  return String(id);
}

// Public — get any advocate's badges by their user ID or advocate profile ID
export const getAdvocateBadges = asyncHandler(async (req, res) => {
  const rawId = req.params.id || req.params.advocateId;
  if (!rawId) throw ApiError.badRequest('Advocate ID required');
  const userId = await resolveAdvocateUserId(rawId);
  const result = await badgeService.getAdvocateBadges(userId);
  res.json({ success: true, data: result });
});

// Protected — get the logged-in advocate's own badges
export const getMyBadges = asyncHandler(async (req, res) => {
  const result = await badgeService.getAdvocateBadges(req.user._id);
  res.json({ success: true, data: result });
});

// Public — get any advocate's achievements milestones by user ID or profile ID
export const getAchievements = asyncHandler(async (req, res) => {
  const rawId = req.params.id || req.params.advocateId;
  if (!rawId) throw ApiError.badRequest('Advocate ID required');
  const userId = await resolveAdvocateUserId(rawId);
  const achievements = await badgeService.getAchievements(userId);
  res.json({ success: true, data: achievements });
});

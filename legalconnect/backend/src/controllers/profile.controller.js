import { User } from '../models/User.js';
import { AdvocateProfile } from '../models/AdvocateProfile.js';
import { ClientProfile } from '../models/ClientProfile.js';
import { Review } from '../models/Review.js';
import { UserBadge } from '../models/Badge.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES, VERIFICATION_STATUS } from '../constants/index.js';

// ─── Advocate Profile ───────────────────────────────────────────

export const getMyAdvocateProfile = asyncHandler(async (req, res) => {
  const profile = await AdvocateProfile.findOne({ user: req.user._id })
    .populate('user', 'name email phone avatar status');
  if (!profile) throw ApiError.notFound('Profile not found');
  res.json({ success: true, data: profile });
});

export const updateAdvocateProfile = asyncHandler(async (req, res) => {
  const allowed = ['headline', 'bio', 'practiceAreas', 'experienceYears', 'qualifications',
    'languages', 'location', 'consultationFee', 'consultationModes'];
  const updates = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  const profile = await AdvocateProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!profile) throw ApiError.notFound('Profile not found');
  res.json({ success: true, data: profile });
});

// ─── Client Profile ─────────────────────────────────────────────

export const getMyClientProfile = asyncHandler(async (req, res) => {
  const profile = await ClientProfile.findOne({ user: req.user._id })
    .populate('user', 'name email phone avatar status');
  if (!profile) throw ApiError.notFound('Profile not found');
  res.json({ success: true, data: profile });
});

export const updateClientProfile = asyncHandler(async (req, res) => {
  const allowed = ['bio', 'location', 'preferredLanguages', 'occupation'];
  const updates = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  const profile = await ClientProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!profile) throw ApiError.notFound('Profile not found');
  res.json({ success: true, data: profile });
});

// ─── Shared: update own user info (name, phone) ─────────────────

export const updateUserInfo = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone'];
  const updates = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });
  res.json({ success: true, data: user });
});

// ─── Advocate Discovery ──────────────────────────────────────────

export const searchAdvocates = asyncHandler(async (req, res) => {
  const {
    practiceArea, city, state, minExp, maxExp, minFee, maxFee,
    language, mode, minRating, verified, page = 1, limit = 12, sort = 'rating',
  } = req.query;

  const profileQuery = { verificationStatus: VERIFICATION_STATUS.VERIFIED };

  if (practiceArea) profileQuery.practiceAreas = { $in: [practiceArea] };
  if (city) profileQuery['location.city'] = { $regex: city, $options: 'i' };
  if (state) profileQuery['location.state'] = { $regex: state, $options: 'i' };
  if (minExp || maxExp) {
    profileQuery.experienceYears = {};
    if (minExp) profileQuery.experienceYears.$gte = Number(minExp);
    if (maxExp) profileQuery.experienceYears.$lte = Number(maxExp);
  }
  if (minFee || maxFee) {
    profileQuery.consultationFee = {};
    if (minFee) profileQuery.consultationFee.$gte = Number(minFee);
    if (maxFee) profileQuery.consultationFee.$lte = Number(maxFee);
  }
  if (language) profileQuery.languages = { $in: [language] };
  if (mode) profileQuery.consultationModes = { $in: [mode] };

  const profiles = await AdvocateProfile.find(profileQuery)
    .populate('user', 'name email avatar status')
    .lean();

  // Attach review stats
  const userIds = profiles.map((p) => p.user?._id).filter(Boolean);
  const reviews = await Review.aggregate([
    { $match: { advocate: { $in: userIds }, isHidden: false } },
    {
      $group: {
        _id: '$advocate',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);
  const reviewMap = {};
  reviews.forEach((r) => { reviewMap[String(r._id)] = r; });

  const userBadges = await UserBadge.find({ user: { $in: userIds } })
    .populate('badge', 'name icon type color')
    .lean();
  const badgeMap = {};
  userBadges.forEach((ub) => {
    const uid = String(ub.user);
    if (!badgeMap[uid]) badgeMap[uid] = [];
    if (ub.badge) badgeMap[uid].push(ub.badge);
  });

  let enriched = profiles.map((p) => {
    const uid = String(p.user?._id);
    const stats = reviewMap[uid] || { avgRating: 0, reviewCount: 0 };
    return {
      ...p,
      avgRating: Math.round((stats.avgRating || 0) * 10) / 10,
      reviewCount: stats.reviewCount || 0,
      badges: badgeMap[uid] || [],
    };
  });

  // Filter by rating
  if (minRating) enriched = enriched.filter((p) => p.avgRating >= Number(minRating));

  // Sort
  if (sort === 'rating') enriched.sort((a, b) => b.avgRating - a.avgRating);
  else if (sort === 'experience') enriched.sort((a, b) => b.experienceYears - a.experienceYears);
  else if (sort === 'fee_asc') enriched.sort((a, b) => a.consultationFee - b.consultationFee);
  else if (sort === 'fee_desc') enriched.sort((a, b) => b.consultationFee - a.consultationFee);

  const total = enriched.length;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const paginated = enriched.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    data: {
      advocates: paginated,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

export const getAdvocatePublicProfile = asyncHandler(async (req, res) => {
  const advocate = await User.findById(req.params.id).select('name email avatar createdAt');
  if (!advocate || advocate.role !== ROLES.ADVOCATE) throw ApiError.notFound('Advocate not found');

  const profile = await AdvocateProfile.findOne({ user: advocate._id });
  if (!profile) throw ApiError.notFound('Profile not found');

  const [reviewStats] = await Review.aggregate([
    { $match: { advocate: advocate._id, isHidden: false } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
        avgCommunication: { $avg: '$communicationRating' },
        avgProfessionalism: { $avg: '$professionalismRating' },
        avgResponsiveness: { $avg: '$responsivenessRating' },
      },
    },
  ]);

  const recentReviews = await Review.find({ advocate: advocate._id, isHidden: false })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('client', 'name avatar');

  const badges = await UserBadge.find({ user: advocate._id })
    .populate('badge', 'name icon type color description')
    .lean();

  res.json({
    success: true,
    data: {
      user: advocate,
      profile,
      stats: reviewStats || { avgRating: 0, reviewCount: 0 },
      recentReviews,
      badges: badges.map((ub) => ub.badge).filter(Boolean),
    },
  });
});

import { User } from '../models/User.js';
import { AdvocateProfile } from '../models/AdvocateProfile.js';
import { Consultation } from '../models/Consultation.js';
import { Case } from '../models/Case.js';
import { Payment } from '../models/Payment.js';
import { Report } from '../models/Report.js';
import { AuditLog } from '../models/AuditLog.js';
import { Badge, UserBadge } from '../models/Badge.js';
import { PlatformSetting } from '../models/PlatformSetting.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { VERIFICATION_STATUS, NOTIFICATION_TYPES, PAYMENT_STATUS } from '../constants/index.js';
import { createNotification } from '../services/notification.service.js';
import { checkAndAwardBadges } from '../services/badge.service.js';
import { logAudit } from '../services/audit.service.js';

function getIo(req) { return req.app.get('io'); }

// ─── Dashboard ───────────────────────────────────────────────────

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalClients, totalAdvocates, verifiedAdvocates,
    activeCases, totalConsultations, totalPayments,
    pendingReports, pendingVerifications,
    recentPayments, recentConsultations,
  ] = await Promise.all([
    User.countDocuments({ role: 'client' }),
    User.countDocuments({ role: 'advocate' }),
    AdvocateProfile.countDocuments({ verificationStatus: VERIFICATION_STATUS.VERIFIED }),
    Case.countDocuments({ status: { $nin: ['Resolved', 'Closed'] }, isArchived: false }),
    Consultation.countDocuments(),
    Payment.aggregate([{ $match: { status: PAYMENT_STATUS.SUCCESSFUL } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Report.countDocuments({ status: 'Pending' }),
    AdvocateProfile.countDocuments({ verificationStatus: { $in: [VERIFICATION_STATUS.PENDING, VERIFICATION_STATUS.UNDER_REVIEW] } }),
    Payment.find({ status: PAYMENT_STATUS.SUCCESSFUL }).sort({ paidAt: -1 }).limit(5).populate('client', 'name').populate('advocate', 'name'),
    Consultation.find().sort({ createdAt: -1 }).limit(5).populate('client', 'name').populate('advocate', 'name'),
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalClients,
        totalAdvocates,
        verifiedAdvocates,
        activeCases,
        totalConsultations,
        totalRevenue: totalPayments[0]?.total || 0,
        pendingReports,
        pendingVerifications,
      },
      recentPayments,
      recentConsultations,
    },
  });
});

// ─── Users ───────────────────────────────────────────────────────

export const getUsers = asyncHandler(async (req, res) => {
  const { role, status, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (status) query.status = status;
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .select('-password -tokenVersion');

  res.json({ success: true, data: { users, total, page: Number(page), pages: Math.ceil(total / limit) } });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const io = getIo(req);
  const { status } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password -tokenVersion');
  if (!user) throw ApiError.notFound('User not found');

  await createNotification(io, {
    recipient: user._id,
    type: status === 'active' ? NOTIFICATION_TYPES.VERIFICATION_UPDATE : NOTIFICATION_TYPES.VERIFICATION_UPDATE,
    title: status === 'active' ? 'Account Activated' : 'Account Suspended',
    message: status === 'active' ? 'Your account has been reactivated.' : 'Your account has been suspended. Contact support.',
    link: '/',
  });

  await logAudit({ actor: req.user._id, action: `admin.user.${status}`, entityType: 'User', entityId: user._id, req });
  res.json({ success: true, data: user });
});

// ─── Advocate Verification ────────────────────────────────────────

export const getVerificationQueue = asyncHandler(async (req, res) => {
  const { status = 'Pending,Under Review', page = 1, limit = 20 } = req.query;
  const statuses = status.split(',').map((s) => s.trim());

  const query = { verificationStatus: { $in: statuses } };
  const total = await AdvocateProfile.countDocuments(query);
  const profiles = await AdvocateProfile.find(query)
    .sort({ createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('user', 'name email avatar createdAt');

  res.json({ success: true, data: { profiles, total, page: Number(page), pages: Math.ceil(total / limit) } });
});

export const updateVerificationStatus = asyncHandler(async (req, res) => {
  const io = getIo(req);
  const { status, notes } = req.body;

  if (!Object.values(VERIFICATION_STATUS).includes(status)) {
    throw ApiError.badRequest('Invalid verification status');
  }

  const profile = await AdvocateProfile.findOne({ user: req.params.id });
  if (!profile) throw ApiError.notFound('Advocate profile not found');

  profile.verificationStatus = status;
  if (status === VERIFICATION_STATUS.VERIFIED) profile.verifiedAt = new Date();
  await profile.save();

  const titleMap = {
    [VERIFICATION_STATUS.UNDER_REVIEW]: 'Application Under Review',
    [VERIFICATION_STATUS.VERIFIED]: 'Application Approved — Verified!',
    [VERIFICATION_STATUS.REJECTED]: 'Application Rejected',
    [VERIFICATION_STATUS.SUSPENDED]: 'Account Suspended',
  };

  await createNotification(io, {
    recipient: req.params.id,
    type: NOTIFICATION_TYPES.VERIFICATION_UPDATE,
    title: titleMap[status] || 'Verification Update',
    message: notes || `Your verification status has been updated to: ${status}`,
    link: '/advocate/profile',
    metadata: { status },
  });

  if (status === VERIFICATION_STATUS.VERIFIED) {
    checkAndAwardBadges(io, req.params.id, profile).catch(() => {});
  }

  await logAudit({ actor: req.user._id, action: 'admin.verification.updated', entityType: 'AdvocateProfile', entityId: profile._id, metadata: { status }, req });
  res.json({ success: true, data: profile });
});

// ─── Consultations Overview ───────────────────────────────────────

export const getAllConsultations = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 50 } = req.query;
  const query = {};
  if (status) query.status = status;

  let queryBuilder = Consultation.find(query)
    .sort({ createdAt: -1 })
    .populate('client', 'name email phone avatar')
    .populate('advocate', 'name email phone avatar')
    .populate('payment', 'amount status receiptNumber');

  let consultations = await queryBuilder;

  if (search?.trim()) {
    const s = search.trim().toLowerCase();
    consultations = consultations.filter(
      (c) =>
        c.client?.name?.toLowerCase().includes(s) ||
        c.advocate?.name?.toLowerCase().includes(s) ||
        c.legalIssue?.toLowerCase().includes(s) ||
        c.practiceArea?.toLowerCase().includes(s)
    );
  }

  const total = consultations.length;
  const paginated = consultations.slice((page - 1) * limit, page * limit);

  res.json({ success: true, data: { consultations: paginated, total, page: Number(page), pages: Math.ceil(total / limit) } });
});

// ─── Cases Overview ───────────────────────────────────────────────

export const getAllCases = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 50 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search?.trim()) {
    query.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { caseId: { $regex: search.trim(), $options: 'i' } },
      { practiceArea: { $regex: search.trim(), $options: 'i' } },
      { courtName: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const total = await Case.countDocuments(query);
  const cases = await Case.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('client', 'name email phone avatar')
    .populate('advocate', 'name email phone avatar');

  res.json({ success: true, data: { cases, total, page: Number(page), pages: Math.ceil(total / limit) } });
});

// ─── Payments Overview ────────────────────────────────────────────

export const getAllPayments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;

  const total = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('client', 'name email')
    .populate('advocate', 'name email');

  res.json({ success: true, data: { payments, total, page: Number(page), pages: Math.ceil(total / limit) } });
});

// ─── Audit Logs ───────────────────────────────────────────────────

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, action, actorId, search } = req.query;
  const query = {};
  if (action) query.action = { $regex: action, $options: 'i' };
  if (actorId) query.actor = actorId;
  if (search) {
    const matchingUsers = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');
    const userIds = matchingUsers.map((u) => u._id);

    query.$or = [
      { action: { $regex: search, $options: 'i' } },
      { entityType: { $regex: search, $options: 'i' } },
      { ip: { $regex: search, $options: 'i' } },
      ...(userIds.length > 0 ? [{ actor: { $in: userIds } }] : []),
    ];
  }

  const total = await AuditLog.countDocuments(query);
  const logs = await AuditLog.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('actor', 'name email role');

  res.json({ success: true, data: { logs, total, page: Number(page), pages: Math.ceil(total / limit) } });
});

// ─── Badges Management ────────────────────────────────────────────

export const getBadges = asyncHandler(async (req, res) => {
  const badges = await Badge.find().sort({ name: 1 });
  res.json({ success: true, data: badges });
});

export const updateBadge = asyncHandler(async (req, res) => {
  const badge = await Badge.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  if (!badge) throw ApiError.notFound('Badge not found');
  res.json({ success: true, data: badge });
});

// ─── All Advocates List ───────────────────────────────────────────

export const getAllAdvocates = asyncHandler(async (req, res) => {
  const { verificationStatus, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (verificationStatus) query.verificationStatus = verificationStatus;

  let profileQuery = AdvocateProfile.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('user', 'name email avatar createdAt status');

  // If searching, filter by name/email after populate (simplest approach)
  let profiles = await profileQuery;
  if (search) {
    const regex = new RegExp(search, 'i');
    profiles = profiles.filter(
      (p) => regex.test(p.user?.name) || regex.test(p.user?.email)
    );
  }

  const total = await AdvocateProfile.countDocuments(query);
  res.json({ success: true, data: { advocates: profiles, total, page: Number(page) } });
});

// ─── Grant Badge to Advocate ─────────────────────────────────────

export const grantBadgeToUser = asyncHandler(async (req, res) => {
  const { userId, badgeType } = req.body;
  if (!userId || !badgeType) throw ApiError.badRequest('userId and badgeType are required');

  const badge = await Badge.findOne({ type: badgeType });
  if (!badge) throw ApiError.notFound('Badge type not found');

  const { UserBadge } = await import('../models/Badge.js');

  // Upsert — don't duplicate
  const existing = await UserBadge.findOne({ user: userId, badge: badge._id });
  if (existing) {
    return res.json({ success: true, data: existing, message: 'Badge already granted' });
  }

  const userBadge = await UserBadge.create({ user: userId, badge: badge._id, awardedBy: req.user._id });

  await logAudit({
    actor: req.user._id,
    action: 'admin.badge.granted',
    entityType: 'UserBadge',
    entityId: userBadge._id,
    metadata: { badgeType, userId },
    req,
  });

  res.status(201).json({ success: true, data: userBadge });
});

// ─── Granted Badges List & Revocation ─────────────────────────────

export const getGrantedBadges = asyncHandler(async (req, res) => {
  const userBadges = await UserBadge.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name email avatar role')
    .populate('badge', 'name type icon description')
    .populate('awardedBy', 'name');
  res.json({ success: true, data: userBadges });
});

export const revokeBadge = asyncHandler(async (req, res) => {
  const userBadge = await UserBadge.findByIdAndDelete(req.params.id);
  if (!userBadge) throw ApiError.notFound('Badge award not found');
  await logAudit({
    actor: req.user._id,
    action: 'admin.badge.revoked',
    entityType: 'UserBadge',
    entityId: userBadge._id,
    metadata: { userId: userBadge.user, badgeId: userBadge.badge },
    req,
  });
  res.json({ success: true, message: 'Badge revoked successfully' });
});

// ─── User Full Inspection ─────────────────────────────────────────

export const getUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -tokenVersion').lean();
  if (!user) throw ApiError.notFound('User not found');

  let profile = null;
  if (user.role === 'advocate') {
    profile = await AdvocateProfile.findOne({ user: user._id }).lean();
  }

  const [consultations, cases, payments] = await Promise.all([
    Consultation.find({ [user.role]: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('client', 'name email')
      .populate('advocate', 'name email')
      .lean(),
    Case.find({ [user.role]: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Payment.find({ [user.role]: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  const [totalConsultations, totalCases, totalPayments] = await Promise.all([
    Consultation.countDocuments({ [user.role]: user._id }),
    Case.countDocuments({ [user.role]: user._id }),
    Payment.countDocuments({ [user.role]: user._id }),
  ]);

  res.json({
    success: true,
    data: {
      user,
      profile,
      consultations,
      cases,
      payments,
      stats: {
        totalConsultations,
        totalCases,
        totalPayments,
      },
    },
  });
});

// ─── Platform Analytics ───────────────────────────────────────────

export const getAnalytics = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyPayments = await Payment.aggregate([
    { $match: { status: PAYMENT_STATUS.SUCCESSFUL, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        revenue: { $sum: '$amount' },
        platformFee: { $sum: '$platformFee' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthlyConsultations = await Consultation.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          status: '$status',
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const practiceAreas = await Consultation.aggregate([
    { $group: { _id: '$practiceArea', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
  ]);

  const [totalClients, totalAdvocates, verifiedAdvocates, activeCases, totalRevenueResult] = await Promise.all([
    User.countDocuments({ role: 'client' }),
    User.countDocuments({ role: 'advocate' }),
    AdvocateProfile.countDocuments({ verificationStatus: VERIFICATION_STATUS.VERIFIED }),
    Case.countDocuments({ isArchived: false, status: { $nin: ['Resolved', 'Closed'] } }),
    Payment.aggregate([
      { $match: { status: PAYMENT_STATUS.SUCCESSFUL } },
      { $group: { _id: null, total: { $sum: '$amount' }, platformFee: { $sum: '$platformFee' } } },
    ]),
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueChart = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const label = `${monthNames[m - 1]} ${y}`;

    const matchPay = monthlyPayments.find((p) => p._id.year === y && p._id.month === m);
    const consForMonth = monthlyConsultations.filter((c) => c._id.year === y && c._id.month === m);
    const confirmedCount = consForMonth
      .filter((c) => c._id.status === 'Confirmed' || c._id.status === 'Completed')
      .reduce((s, c) => s + c.count, 0);
    const pendingCount = consForMonth
      .filter((c) => c._id.status === 'Pending')
      .reduce((s, c) => s + c.count, 0);

    revenueChart.push({
      month: label,
      revenue: matchPay?.revenue || 0,
      platformFee: matchPay?.platformFee || Math.round((matchPay?.revenue || 0) * 0.1),
      transactions: matchPay?.count || 0,
      consultations: confirmedCount + pendingCount,
      confirmed: confirmedCount,
    });
  }

  res.json({
    success: true,
    data: {
      stats: {
        totalClients,
        totalAdvocates,
        verifiedAdvocates,
        activeCases,
        totalRevenue: totalRevenueResult[0]?.total || 0,
        totalPlatformFee: totalRevenueResult[0]?.platformFee || 0,
      },
      revenueChart,
      practiceAreas: practiceAreas.map((p) => ({ name: p._id || 'General', value: p.count })),
    },
  });
});

// ─── Platform Settings ────────────────────────────────────────────

export const getPlatformSettings = asyncHandler(async (req, res) => {
  let settings = await PlatformSetting.findOne();
  if (!settings) {
    settings = await PlatformSetting.create({});
  }
  res.json({ success: true, data: settings });
});

export const updatePlatformSettings = asyncHandler(async (req, res) => {
  const allowed = [
    'platformCommissionPercent',
    'minConsultationFee',
    'escrowHoldHours',
    'maintenanceMode',
    'announcementBanner',
    'supportEmail',
    'supportPhone',
  ];
  const updates = {};
  for (const f of allowed) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }

  let settings = await PlatformSetting.findOneAndUpdate(
    {},
    { $set: updates },
    { new: true, upsert: true, runValidators: true }
  );

  await logAudit({
    actor: req.user._id,
    action: 'admin.settings.updated',
    entityType: 'PlatformSetting',
    entityId: settings._id,
    metadata: updates,
    req,
  });

  const io = getIo(req);
  if (io) {
    io.emit('platform:status:updated', {
      maintenanceMode: Boolean(settings.maintenanceMode),
      announcementBanner: settings.announcementBanner,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
    });
  }

  res.json({ success: true, data: settings });
});



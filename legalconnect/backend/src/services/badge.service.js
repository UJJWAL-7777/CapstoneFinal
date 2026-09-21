import { Badge, UserBadge } from '../models/Badge.js';
import { Consultation } from '../models/Consultation.js';
import { Review } from '../models/Review.js';
import { BADGE_TYPES, CONSULTATION_STATUS, NOTIFICATION_TYPES } from '../constants/index.js';
import { createNotification } from './notification.service.js';

const BADGE_DEFINITIONS = [
  {
    type: BADGE_TYPES.VERIFIED_ADVOCATE,
    name: 'Verified Advocate',
    description: 'Identity and Bar Council credentials verified by LegalConnect',
    icon: '🛡️',
    criteria: { metric: 'verificationStatus', threshold: 1, operator: 'eq' },
    color: '#2F7367',
  },
  {
    type: BADGE_TYPES.QUICK_RESPONDER,
    name: 'Quick Responder',
    description: 'Responds to consultation requests within 2 hours',
    icon: '⚡',
    criteria: { metric: 'avgResponseTime', threshold: 120, operator: 'lte' }, // minutes
    color: '#C9A257',
  },
  {
    type: BADGE_TYPES.RELIABLE_ADVOCATE,
    name: 'Reliable Advocate',
    description: '90%+ consultation completion rate',
    icon: '📅',
    criteria: { metric: 'completionRate', threshold: 90, operator: 'gte' },
    color: '#4A8E80',
  },
  {
    type: BADGE_TYPES.ACTIVE_CONSULTANT,
    name: 'Active Consultant',
    description: 'Completed 50+ consultations',
    icon: '💬',
    criteria: { metric: 'completedConsultations', threshold: 50, operator: 'gte' },
    color: '#245B52',
  },
  {
    type: BADGE_TYPES.EXPERIENCED_ADVOCATE,
    name: 'Experienced Advocate',
    description: '10+ years of legal experience',
    icon: '📚',
    criteria: { metric: 'experienceYears', threshold: 10, operator: 'gte' },
    color: '#1D4A43',
  },
  {
    type: BADGE_TYPES.CLIENT_TRUSTED,
    name: 'Client Trusted',
    description: 'Average rating of 4.5+ from 20+ verified reviews',
    icon: '🤝',
    criteria: { metric: 'rating', threshold: 4.5, operator: 'gte' },
    color: '#96712D',
  },
];

export async function seedBadges() {
  for (const def of BADGE_DEFINITIONS) {
    await Badge.findOneAndUpdate({ type: def.type }, def, { upsert: true, new: true });
  }
}

export async function getAdvocateBadges(advocateUserId) {
  const earnedBadges = await UserBadge.find({ user: advocateUserId })
    .populate('badge')
    .lean();

  const allBadges = await Badge.find({ isActive: true }).lean();

  const earnedTypes = new Set(earnedBadges.map((ub) => ub.badge?.type));

  // Calculate current progress for each badge
  const stats = await getAdvocateStats(advocateUserId);

  const badgesWithProgress = allBadges.map((badge) => {
    const earned = earnedBadges.find((ub) => ub.badge?.type === badge.type);
    const metric = badge.criteria?.metric;
    const threshold = badge.criteria?.threshold || 0;
    const current = stats[metric] ?? 0;

    return {
      ...badge,
      isEarned: earnedTypes.has(badge.type),
      earnedAt: earned?.awardedAt,
      progress: { current, threshold },
    };
  });

  return { badges: badgesWithProgress, stats };
}

export async function getAdvocateStats(advocateUserId) {
  const [consultations, reviews] = await Promise.all([
    Consultation.find({ advocate: advocateUserId }).lean(),
    Review.find({ advocate: advocateUserId, isHidden: false }).lean(),
  ]);

  const completed = consultations.filter((c) => c.status === CONSULTATION_STATUS.COMPLETED);
  const confirmed = consultations.filter(
    (c) => [CONSULTATION_STATUS.COMPLETED, CONSULTATION_STATUS.NO_SHOW, CONSULTATION_STATUS.CONFIRMED].includes(c.status)
  );

  const completionRate = confirmed.length > 0 ? (completed.length / confirmed.length) * 100 : 0;
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return {
    completedConsultations: completed.length,
    totalConsultations: consultations.length,
    completionRate: Math.round(completionRate),
    avgRating: Math.round(avgRating * 10) / 10,
    reviewCount: reviews.length,
  };
}

export async function checkAndAwardBadges(io, advocateUserId, advocateProfile) {
  const stats = await getAdvocateStats(advocateUserId);
  const allBadges = await Badge.find({ isActive: true }).lean();
  const existingBadges = await UserBadge.find({ user: advocateUserId }).select('badge').lean();
  const existingBadgeIds = new Set(existingBadges.map((ub) => String(ub.badge)));

  for (const badge of allBadges) {
    if (existingBadgeIds.has(String(badge._id))) continue;

    const { metric, threshold, operator } = badge.criteria || {};
    let metricValue;

    if (metric === 'verificationStatus') {
      metricValue = advocateProfile?.verificationStatus === 'Verified' ? 1 : 0;
    } else if (metric === 'experienceYears') {
      metricValue = advocateProfile?.experienceYears || 0;
    } else {
      metricValue = stats[metric] ?? 0;
    }

    const earned =
      operator === 'gte' ? metricValue >= threshold :
      operator === 'lte' ? metricValue <= threshold :
      metricValue === threshold;

    if (earned) {
      await UserBadge.create({
        user: advocateUserId,
        badge: badge._id,
        progress: metricValue,
      });

      await createNotification(io, {
        recipient: advocateUserId,
        type: NOTIFICATION_TYPES.BADGE_ACHIEVED,
        title: `Badge Earned: ${badge.name}`,
        message: `Congratulations! You've earned the ${badge.icon} ${badge.name} badge.`,
        link: '/advocate/badges',
        metadata: { badgeType: badge.type },
      });
    }
  }
}

export async function getAchievements(advocateUserId) {
  const stats = await getAdvocateStats(advocateUserId);
  const milestones = [1, 5, 10, 25, 50, 100];

  return milestones.map((milestone) => ({
    label: milestone === 1 ? 'First Consultation' : `${milestone} Consultations Milestone`,
    milestone,
    target: milestone,
    current: Math.min(stats.completedConsultations || 0, milestone),
    unlocked: (stats.completedConsultations || 0) >= milestone,
    unlockedAt: null,
  }));
}

/**
 * Tier computation logic — mirrors TABLE II (Provider Tier Structure and
 * Benefits) from the LegalConnect capstone report.
 *
 *   Bronze   : verified profile, 0-4 completed engagements
 *   Silver   : 5-24 engagements, rating >= 4.0
 *   Gold     : 25-99 engagements, rating >= 4.3, response time < 2 hrs
 *   Platinum : 100+ engagements, rating >= 4.6, low dispute rate
 */
export function computeTier(provider) {
  const { engagementsCount = 0, rating = 0, responseTimeHours = 24, disputeRate = 0 } = provider;

  if (engagementsCount >= 100 && rating >= 4.6 && disputeRate < 0.03) {
    return "Platinum";
  }
  if (engagementsCount >= 25 && rating >= 4.3 && responseTimeHours < 2) {
    return "Gold";
  }
  if (engagementsCount >= 5 && rating >= 4.0) {
    return "Silver";
  }
  return "Bronze";
}

// Referral / milestone bonus thresholds (Section VI-A)
export const MILESTONES = [5, 25, 100];

export function nextMilestone(engagementsCount) {
  return MILESTONES.find((m) => engagementsCount < m) ?? null;
}

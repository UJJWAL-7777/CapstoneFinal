import Provider from "../models/Provider.js";
import { computeTier, nextMilestone } from "../utils/tier.js";

// GET /api/providers?type=advocate&district=Jalandhar&specialization=Family&tier=Gold&q=singh
export async function listProviders(req, res) {
  try {
    const { type, state, district, specialization, tier, q, page = 1, limit = 12 } = req.query;

    const filter = {};
    if (type) filter.providerType = type;
    if (state) filter["location.state"] = new RegExp(`^${state}$`, "i");
    if (district) filter["location.district"] = new RegExp(`^${district}$`, "i");
    if (specialization) filter.specialization = new RegExp(specialization, "i");
    if (tier) filter.tier = tier;
    if (q) filter.$text = { $search: q };

    const skip = (Number(page) - 1) * Number(limit);

    const [providers, total] = await Promise.all([
      Provider.find(filter).sort({ tier: -1, rating: -1 }).skip(skip).limit(Number(limit)),
      Provider.countDocuments(filter),
    ]);

    res.json({ total, page: Number(page), pageSize: providers.length, providers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getProvider(req, res) {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ error: "Provider not found" });
    res.json({
      ...provider.toObject(),
      nextMilestone: nextMilestone(provider.engagementsCount),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/providers  — onboarding
export async function createProvider(req, res) {
  try {
    const provider = new Provider(req.body);
    provider.tier = computeTier(provider);
    await provider.save();
    res.status(201).json(provider);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// PATCH /api/providers/:id/engagement — record a completed engagement,
// recompute tier, and report whether a milestone bonus was just unlocked.
export async function recordEngagement(req, res) {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ error: "Provider not found" });

    const { rating } = req.body; // rating given for this engagement (0-5)

    const priorCount = provider.engagementsCount;
    provider.engagementsCount += 1;
    if (typeof rating === "number") {
      // running average
      provider.rating = (provider.rating * priorCount + rating) / provider.engagementsCount;
    }

    const priorTier = provider.tier;
    provider.tier = computeTier(provider);

    const milestoneHit = [5, 25, 100].includes(provider.engagementsCount);

    await provider.save();

    res.json({
      provider,
      tierChanged: priorTier !== provider.tier,
      milestoneBonusUnlocked: milestoneHit,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// GET /api/providers/stats/tiers — counts per tier, for a simple dashboard
export async function tierStats(req, res) {
  try {
    const stats = await Provider.aggregate([
      { $group: { _id: "$tier", count: { $sum: 1 } } },
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

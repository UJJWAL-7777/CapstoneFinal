import Review from "../models/Review.js";
import Provider from "../models/Provider.js";
import User from "../models/User.js";

// POST /api/reviews
export async function createReview(req, res) {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ error: "Only clients can write reviews" });
    }

    const { advocateUserId, caseId, rating, comment } = req.body;

    const review = new Review({
      advocate: advocateUserId,
      client: req.user.id,
      case: caseId || undefined,
      rating,
      comment,
    });

    await review.save();

    // Update advocate's provider rating (running average)
    const advocateUser = await User.findById(advocateUserId);
    if (advocateUser?.advocateProfile) {
      const allReviews = await Review.find({ advocate: advocateUserId });
      const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await Provider.findByIdAndUpdate(advocateUser.advocateProfile, {
        rating: Math.round(avgRating * 10) / 10,
      });
    }

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this case" });
    }
    res.status(400).json({ error: err.message });
  }
}

// GET /api/reviews/advocate/:id
export async function getAdvocateReviews(req, res) {
  try {
    const reviews = await Review.find({ advocate: req.params.id })
      .populate("client", "name profilePicture")
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({ reviews, avgRating: Math.round(avgRating * 10) / 10, total: reviews.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

import { Review } from '../models/Review.js';
import { Consultation } from '../models/Consultation.js';
import { AdvocateProfile } from '../models/AdvocateProfile.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { CONSULTATION_STATUS, NOTIFICATION_TYPES } from '../constants/index.js';
import { createNotification } from '../services/notification.service.js';
import { checkAndAwardBadges } from '../services/badge.service.js';

function getIo(req) { return req.app.get('io'); }

export const createReview = asyncHandler(async (req, res) => {
  const io = getIo(req);
  const { consultationId, rating, comment, communicationRating, professionalismRating, responsivenessRating } = req.body;

  const consultation = await Consultation.findById(consultationId);
  if (!consultation) throw ApiError.notFound('Consultation not found');
  if (String(consultation.client) !== String(req.user._id)) throw ApiError.forbidden('Only the client can leave a review');
  if (consultation.status !== CONSULTATION_STATUS.COMPLETED) {
    throw ApiError.badRequest('Can only review completed consultations');
  }
  if (consultation.reviewedByClient) throw ApiError.conflict('You have already reviewed this consultation');

  const review = await Review.create({
    consultation: consultationId,
    client: req.user._id,
    advocate: consultation.advocate,
    rating,
    comment,
    communicationRating,
    professionalismRating,
    responsivenessRating,
  });

  consultation.reviewedByClient = true;
  await consultation.save();

  await createNotification(io, {
    recipient: consultation.advocate,
    type: NOTIFICATION_TYPES.REVIEW_RECEIVED,
    title: 'New Review Received',
    message: `${req.user.name} left you a ${rating}-star review.`,
    link: '/advocate/reviews',
    relatedEntity: { type: 'Review', id: review._id },
  });

  // Check badge eligibility
  const profile = await AdvocateProfile.findOne({ user: consultation.advocate });
  checkAndAwardBadges(io, consultation.advocate, profile).catch(() => {});

  res.status(201).json({ success: true, data: review });
});

export const getAdvocateReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const query = { advocate: req.params.advocateId, isHidden: false };

  const total = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('client', 'name avatar');

  const stats = await Review.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        avgCommunication: { $avg: '$communicationRating' },
        avgProfessionalism: { $avg: '$professionalismRating' },
        avgResponsiveness: { $avg: '$responsivenessRating' },
      },
    },
  ]);

  res.json({
    success: true,
    data: { reviews, total, page: Number(page), pages: Math.ceil(total / limit), stats: stats[0] || {} },
  });
});

export const respondToReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw ApiError.notFound('Review not found');
  if (String(review.advocate) !== String(req.user._id)) throw ApiError.forbidden();

  review.advocateResponse = req.body.response;
  review.advocateResponseAt = new Date();
  await review.save();

  res.json({ success: true, data: review });
});

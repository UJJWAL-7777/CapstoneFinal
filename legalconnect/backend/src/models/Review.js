import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    consultation: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation', required: true, unique: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    advocate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    communicationRating: { type: Number, min: 1, max: 5 },
    professionalismRating: { type: Number, min: 1, max: 5 },
    responsivenessRating: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 2000 },
    isVerified: { type: Boolean, default: true }, // all reviews are verified (from completed consultations)
    advocateResponse: { type: String, trim: true, maxlength: 1000 },
    advocateResponseAt: Date,
    isHidden: { type: Boolean, default: false }, // admin can hide
  },
  { timestamps: true }
);

reviewSchema.index({ advocate: 1, createdAt: -1 });

export const Review = mongoose.model('Review', reviewSchema);

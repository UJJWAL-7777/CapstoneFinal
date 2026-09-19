import mongoose from 'mongoose';
import { CONSULTATION_MODES, VERIFICATION_STATUS } from '../constants/index.js';

const advocateProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    barCouncilNumber: { type: String, required: true, trim: true, maxlength: 40 },
    barCouncilState: { type: String, required: true, trim: true, maxlength: 80 },
    headline: { type: String, trim: true, maxlength: 120 },
    bio: { type: String, trim: true, maxlength: 2000 },
    practiceAreas: {
      type: [{ type: String, trim: true }],
      validate: [(v) => v.length > 0, 'Select at least one practice area'],
    },
    experienceYears: { type: Number, min: 0, max: 70, default: 0 },
    qualifications: [
      {
        degree: { type: String, trim: true, maxlength: 120 },
        institution: { type: String, trim: true, maxlength: 160 },
        year: { type: Number, min: 1950, max: 2100 },
      },
    ],
    languages: [{ type: String, trim: true }],
    location: {
      city: { type: String, trim: true, maxlength: 80 },
      state: { type: String, trim: true, maxlength: 80 },
      country: { type: String, trim: true, default: 'India' },
    },
    consultationFee: { type: Number, min: 0, default: 0 },
    consultationModes: {
      type: [{ type: String, enum: CONSULTATION_MODES }],
      default: ['video', 'chat'],
    },
    verificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.PENDING,
    },
    verifiedAt: Date,
  },
  { timestamps: true }
);

// Indexes for advocate discovery (module 5) and admin verification queues (module 6)
advocateProfileSchema.index({ verificationStatus: 1, practiceAreas: 1 });
advocateProfileSchema.index({ 'location.city': 1, 'location.state': 1 });
advocateProfileSchema.index({ consultationFee: 1 });
advocateProfileSchema.index({ experienceYears: -1 });
advocateProfileSchema.index({ barCouncilState: 1, barCouncilNumber: 1 }, { unique: true });

export const AdvocateProfile = mongoose.model('AdvocateProfile', advocateProfileSchema);

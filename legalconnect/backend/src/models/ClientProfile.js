import mongoose from 'mongoose';

const clientProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, trim: true, maxlength: 1000 },
    occupation: { type: String, trim: true, maxlength: 100 },
    dateOfBirth: Date,
    location: {
      city: { type: String, trim: true, maxlength: 80 },
      state: { type: String, trim: true, maxlength: 80 },
      country: { type: String, trim: true, maxlength: 80, default: 'India' },
    },
    address: {
      line1: { type: String, trim: true, maxlength: 200 },
      city: { type: String, trim: true, maxlength: 80 },
      state: { type: String, trim: true, maxlength: 80 },
      postalCode: { type: String, trim: true, maxlength: 20 },
      country: { type: String, trim: true, maxlength: 80, default: 'India' },
    },
    preferredLanguages: [{ type: String, trim: true }],
    legalInterests: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export const ClientProfile = mongoose.model('ClientProfile', clientProfileSchema);


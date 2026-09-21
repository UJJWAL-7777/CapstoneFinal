import mongoose from 'mongoose';

const platformSettingSchema = new mongoose.Schema(
  {
    platformCommissionPercent: {
      type: Number,
      default: 10,
      min: 0,
      max: 50,
    },
    minConsultationFee: {
      type: Number,
      default: 100,
      min: 0,
    },
    escrowHoldHours: {
      type: Number,
      default: 24,
      min: 1,
      max: 168,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    announcementBanner: {
      active: { type: Boolean, default: false },
      message: { type: String, default: '', trim: true, maxlength: 300 },
      type: { type: String, enum: ['info', 'warning', 'success', 'danger'], default: 'info' },
    },
    supportEmail: {
      type: String,
      default: 'support@legalconnect.local',
      trim: true,
    },
    supportPhone: {
      type: String,
      default: '+91 1800 123 4567',
      trim: true,
    },
  },
  { timestamps: true }
);

export const PlatformSetting = mongoose.model('PlatformSetting', platformSettingSchema);

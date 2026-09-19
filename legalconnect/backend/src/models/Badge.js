import mongoose from 'mongoose';
import { BADGE_TYPES } from '../constants/index.js';

// Badge definitions (seeded by admin)
const badgeSchema = new mongoose.Schema(
  {
    type: { type: String, enum: Object.values(BADGE_TYPES), required: true, unique: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    icon: { type: String, required: true }, // emoji or icon name
    criteria: {
      metric: String, // e.g. 'completedConsultations', 'avgResponseTime', 'rating', 'completionRate'
      threshold: Number,
      operator: { type: String, enum: ['gte', 'lte', 'eq'], default: 'gte' },
    },
    isActive: { type: Boolean, default: true },
    color: { type: String, default: '#2F7367' },
  },
  { timestamps: true }
);

// User badge assignments
const userBadgeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
    awardedAt: { type: Date, default: Date.now },
    awardedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null = auto-awarded
    progress: { type: Number, default: 0 }, // current progress value
    isDisplayed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

export const Badge = mongoose.model('Badge', badgeSchema);
export const UserBadge = mongoose.model('UserBadge', userBadgeSchema);

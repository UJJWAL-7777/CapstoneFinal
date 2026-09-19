import mongoose from 'mongoose';
import { NOTIFICATION_TYPES } from '../constants/index.js';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: Object.values(NOTIFICATION_TYPES), required: true },
    title: { type: String, required: true, trim: true, maxlength: 255 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    link: String, // frontend route to navigate to on click
    isRead: { type: Boolean, default: false, index: true },
    metadata: mongoose.Schema.Types.Mixed, // extra context
    relatedEntity: {
      type: { type: String }, // 'Case', 'Consultation', 'Payment', etc.
      id: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);

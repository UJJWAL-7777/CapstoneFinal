import mongoose from 'mongoose';
import { HEARING_STATUS } from '../constants/index.js';

const hearingSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // "10:30 AM"
    court: { type: String, required: true, trim: true, maxlength: 255 },
    purpose: { type: String, required: true, trim: true, maxlength: 500 },
    notes: { type: String, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: Object.values(HEARING_STATUS),
      default: HEARING_STATUS.SCHEDULED,
    },
    nextDate: Date, // if adjourned
    requiredDocuments: [{ type: String, trim: true }],
    outcome: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

hearingSchema.index({ case: 1, date: 1 });
hearingSchema.index({ date: 1 }); // for upcoming hearings across all cases

export const Hearing = mongoose.model('Hearing', hearingSchema);

import mongoose from 'mongoose';
import { TIMELINE_EVENT_TYPES } from '../constants/index.js';

const caseTimelineSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: Object.values(TIMELINE_EVENT_TYPES),
      default: TIMELINE_EVENT_TYPES.CUSTOM,
    },
    title: { type: String, required: true, trim: true, maxlength: 255 },
    description: { type: String, trim: true, maxlength: 2000 },
    eventDate: { type: Date, default: Date.now },
    metadata: mongoose.Schema.Types.Mixed, // flexible extra data
  },
  { timestamps: true }
);

caseTimelineSchema.index({ case: 1, eventDate: -1 });

export const CaseTimeline = mongoose.model('CaseTimeline', caseTimelineSchema);

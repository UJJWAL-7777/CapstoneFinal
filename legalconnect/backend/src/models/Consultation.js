import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { CONSULTATION_STATUS, CONSULTATION_MODES } from '../constants/index.js';

const consultationSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    advocate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g. "10:00"
    duration: { type: Number, required: true, enum: [30, 60, 90], default: 60 }, // minutes
    mode: { type: String, required: true, enum: CONSULTATION_MODES },
    status: {
      type: String,
      enum: Object.values(CONSULTATION_STATUS),
      default: CONSULTATION_STATUS.PENDING,
      index: true,
    },
    legalIssue: { type: String, required: true, trim: true, maxlength: 2000 },
    practiceArea: { type: String, trim: true },
    fee: { type: Number, required: true, min: 0 },
    documents: [{ url: String, name: String, publicId: String }],
    advocateNotes: { type: String, trim: true, maxlength: 1000 }, // private to advocate
    rejectionReason: { type: String, trim: true, maxlength: 500 },
    cancellationReason: { type: String, trim: true, maxlength: 500 },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedAt: Date,
    videoRoomId: String, // unique room ID for WebRTC session
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' }, // set after case created
    reviewedByClient: { type: Boolean, default: false },
  },
  { timestamps: true }
);

consultationSchema.index({ client: 1, date: -1 });
consultationSchema.index({ advocate: 1, date: -1 });
consultationSchema.index({ advocate: 1, date: 1, timeSlot: 1 });
consultationSchema.plugin(mongoosePaginate);

export const Consultation = mongoose.model('Consultation', consultationSchema);

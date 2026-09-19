import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { REPORT_TYPES, REPORT_STATUS } from '../constants/index.js';

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: Object.values(REPORT_TYPES), required: true },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    relatedConsultation: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' },
    relatedCase: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
    status: {
      type: String,
      enum: Object.values(REPORT_STATUS),
      default: REPORT_STATUS.PENDING,
      index: true,
    },
    adminNotes: { type: String, trim: true, maxlength: 2000 },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
    actionTaken: String, // e.g. 'suspended', 'warning', 'none'
  },
  { timestamps: true }
);

reportSchema.plugin(mongoosePaginate);
reportSchema.index({ status: 1, createdAt: -1 });

export const Report = mongoose.model('Report', reportSchema);

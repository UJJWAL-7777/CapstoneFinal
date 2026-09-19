import mongoose from 'mongoose';
import { DOCUMENT_CATEGORIES } from '../constants/index.js';

const documentRequestSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 255 },
    description: { type: String, trim: true, maxlength: 1000 },
    category: {
      type: String,
      enum: Object.values(DOCUMENT_CATEGORIES),
      default: DOCUMENT_CATEGORIES.OTHER,
    },
    dueDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'Fulfilled', 'Cancelled'],
      default: 'Pending',
    },
    fulfilledAt: Date,
    fulfilledDocument: { type: mongoose.Schema.Types.ObjectId, ref: 'CaseDocument' },
  },
  { timestamps: true }
);

documentRequestSchema.index({ case: 1, status: 1 });

export const DocumentRequest = mongoose.model('DocumentRequest', documentRequestSchema);

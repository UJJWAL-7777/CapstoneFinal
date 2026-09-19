import mongoose from 'mongoose';
import { DOCUMENT_CATEGORIES } from '../constants/index.js';

const caseDocumentSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    originalName: { type: String, trim: true },
    url: { type: String, required: true },
    publicId: String, // Cloudinary public ID (for deletion)
    mimeType: { type: String, required: true },
    size: { type: Number, required: true }, // bytes
    category: {
      type: String,
      enum: Object.values(DOCUMENT_CATEGORIES),
      default: DOCUMENT_CATEGORIES.OTHER,
    },
    description: { type: String, trim: true, maxlength: 500 },
    isReviewed: { type: Boolean, default: false },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: Date,
    documentRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'DocumentRequest' }, // if fulfilling a request
  },
  { timestamps: true }
);

caseDocumentSchema.index({ case: 1, isDeleted: 1 });

export const CaseDocument = mongoose.model('CaseDocument', caseDocumentSchema);

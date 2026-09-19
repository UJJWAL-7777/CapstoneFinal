import mongoose from 'mongoose';

// Private notes added by the advocate — not visible to client
const caseNoteSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

caseNoteSchema.index({ case: 1, createdAt: -1 });

export const CaseNote = mongoose.model('CaseNote', caseNoteSchema);

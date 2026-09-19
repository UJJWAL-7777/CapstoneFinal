import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', index: true },
    consultation: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation', index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, trim: true, maxlength: 5000 },
    type: {
      type: String,
      enum: ['text', 'document', 'image', 'system'],
      default: 'text',
    },
    attachment: {
      url: String,
      name: String,
      mimeType: String,
      size: Number,
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ case: 1, createdAt: 1 });
messageSchema.index({ consultation: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);

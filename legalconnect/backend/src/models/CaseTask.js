import mongoose from 'mongoose';
import { TASK_STATUS } from '../constants/index.js';

const caseTaskSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 255 },
    description: { type: String, trim: true, maxlength: 2000 },
    dueDate: Date,
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.PENDING,
    },
    completedAt: Date,
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  },
  { timestamps: true }
);

caseTaskSchema.index({ case: 1, status: 1 });
caseTaskSchema.index({ assignedTo: 1, status: 1 });

export const CaseTask = mongoose.model('CaseTask', caseTaskSchema);

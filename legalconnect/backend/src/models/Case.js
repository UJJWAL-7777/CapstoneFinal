import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { CASE_STATUS, CASE_PRIORITY, PRACTICE_AREAS } from '../constants/index.js';

const importantDateSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  description: String,
}, { _id: true });

const caseSchema = new mongoose.Schema(
  {
    caseId: { type: String, unique: true }, // auto-generated e.g. LC-2024-0001
    title: { type: String, required: true, trim: true, maxlength: 200 },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    advocate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    consultation: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' },
    practiceArea: { type: String, trim: true },
    description: { type: String, trim: true, maxlength: 5000 },
    priority: {
      type: String,
      enum: Object.values(CASE_PRIORITY),
      default: CASE_PRIORITY.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(CASE_STATUS),
      default: CASE_STATUS.OPENED,
      index: true,
    },
    importantDates: [importantDateSchema],
    courtName: { type: String, trim: true, maxlength: 200 },
    caseNumber: { type: String, trim: true, maxlength: 100 }, // court case number
    opposingParty: { type: String, trim: true, maxlength: 200 },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

caseSchema.pre('save', async function (next) {
  if (this.isNew && !this.caseId) {
    const count = await mongoose.model('Case').countDocuments();
    const year = new Date().getFullYear();
    this.caseId = `LC-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

caseSchema.index({ client: 1, status: 1 });
caseSchema.index({ advocate: 1, status: 1 });
caseSchema.plugin(mongoosePaginate);

export const Case = mongoose.model('Case', caseSchema);

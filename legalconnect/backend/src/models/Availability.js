import mongoose from 'mongoose';

// Advocate sets recurring availability slots and specific date overrides
const slotSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },   // "10:00"
  isBooked: { type: Boolean, default: false },
}, { _id: false });

const availabilitySchema = new mongoose.Schema(
  {
    advocate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Recurring weekly schedule: 0=Sunday, 1=Monday, ... 6=Saturday
    weeklySchedule: [
      {
        dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
        slots: [slotSchema],
        isActive: { type: Boolean, default: true },
      },
    ],
    // Specific date overrides (holidays, leave, extra slots)
    overrides: [
      {
        date: { type: Date, required: true },
        slots: [slotSchema],
        isBlocked: { type: Boolean, default: false }, // block entire day
        reason: String,
      },
    ],
    timezone: { type: String, default: 'Asia/Kolkata' },
    slotDuration: { type: Number, default: 60, enum: [30, 60, 90] }, // minutes
    advanceBookingDays: { type: Number, default: 30 }, // how far ahead clients can book
  },
  { timestamps: true }
);

availabilitySchema.index({ advocate: 1 }, { unique: true });

export const Availability = mongoose.model('Availability', availabilitySchema);

import { Availability } from '../models/Availability.js';
import { Consultation } from '../models/Consultation.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const getMyAvailability = asyncHandler(async (req, res) => {
  let availability = await Availability.findOne({ advocate: req.user._id });
  if (!availability) {
    availability = await Availability.create({ advocate: req.user._id, weeklySchedule: [] });
  }
  res.json({ success: true, data: availability });
});

export const updateAvailability = asyncHandler(async (req, res) => {
  const { weeklySchedule, overrides, timezone, slotDuration, advanceBookingDays } = req.body;
  const availability = await Availability.findOneAndUpdate(
    { advocate: req.user._id },
    { $set: { weeklySchedule, overrides, timezone, slotDuration, advanceBookingDays } },
    { new: true, upsert: true, runValidators: true }
  );
  res.json({ success: true, data: availability });
});

export const getAdvocateAvailability = asyncHandler(async (req, res) => {
  const { advocateId } = req.params;
  const { date } = req.query; // YYYY-MM-DD

  const availability = await Availability.findOne({ advocate: advocateId });
  if (!availability) return res.json({ success: true, data: { slots: [] } });

  // If a specific date is requested, compute available slots
  if (date) {
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    // Check for date override
    const override = availability.overrides?.find((o) => {
      const od = new Date(o.date);
      return od.toDateString() === requestedDate.toDateString();
    });

    if (override?.isBlocked) {
      return res.json({ success: true, data: { slots: [], isBlocked: true, reason: override.reason } });
    }

    const rawSlots = override?.slots?.length > 0
      ? override.slots
      : availability.weeklySchedule?.find((d) => d.dayOfWeek === dayOfWeek && d.isActive)?.slots || [];

    // Exclude already booked slots
    const bookedConsultations = await Consultation.find({
      advocate: advocateId,
      date: {
        $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
        $lte: new Date(requestedDate.setHours(23, 59, 59, 999)),
      },
      status: { $in: ['Pending', 'Confirmed'] },
    }).select('timeSlot');

    const bookedSlots = new Set(bookedConsultations.map((c) => c.timeSlot));

    const availableSlots = rawSlots.map((slot) => ({
      ...slot,
      isBooked: bookedSlots.has(slot.startTime),
    }));

    return res.json({ success: true, data: { slots: availableSlots, date } });
  }

  res.json({ success: true, data: availability });
});

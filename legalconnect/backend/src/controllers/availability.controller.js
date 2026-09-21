import { Availability } from '../models/Availability.js';
import { Consultation } from '../models/Consultation.js';
import { AdvocateProfile } from '../models/AdvocateProfile.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

const DEFAULT_SLOTS = [
  { startTime: '10:00', endTime: '11:00' },
  { startTime: '11:00', endTime: '12:00' },
  { startTime: '12:00', endTime: '13:00' },
  { startTime: '14:00', endTime: '15:00' },
  { startTime: '15:00', endTime: '16:00' },
  { startTime: '16:00', endTime: '17:00' },
  { startTime: '17:00', endTime: '18:00' },
];

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
  const rawId = req.params.id || req.params.advocateId;
  const { date } = req.query; // YYYY-MM-DD

  // Resolve advocate user ID whether a User ID or AdvocateProfile ID was passed
  let advocateUserId = rawId;
  const profile = await AdvocateProfile.findOne({
    $or: [{ user: rawId }, { _id: rawId }],
  });
  if (profile) {
    advocateUserId = String(profile.user);
  }

  const availability = await Availability.findOne({ advocate: advocateUserId });

  // If a specific date is requested, compute available slots
  if (date) {
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    // Check for date override
    const override = availability?.overrides?.find((o) => {
      const od = new Date(o.date);
      return od.toDateString() === requestedDate.toDateString();
    });

    if (override?.isBlocked) {
      return res.json({ success: true, data: { slots: [], isBlocked: true, reason: override.reason || 'Advocate unavailable' } });
    }

    let rawSlots = [];
    if (override?.slots?.length > 0) {
      rawSlots = override.slots;
    } else if (availability?.weeklySchedule && availability.weeklySchedule.length > 0) {
      const dayConfig = availability.weeklySchedule.find((d) => d.dayOfWeek === dayOfWeek);
      if (dayConfig) {
        rawSlots = dayConfig.isActive ? (dayConfig.slots || []) : [];
      } else {
        // Day not explicitly customized; if Monday-Saturday, provide default slots
        rawSlots = dayOfWeek === 0 ? [] : DEFAULT_SLOTS;
      }
    } else {
      // Advocate has not saved a custom schedule yet: default to Monday-Saturday 10am-6pm
      rawSlots = dayOfWeek === 0 ? [] : DEFAULT_SLOTS;
    }

    const duration = availability?.slotDuration || 60;
    // If a slot spans a range greater than duration (e.g. 09:00 - 17:00), break it into discrete bookable slots
    const discreteSlots = [];
    for (const s of rawSlots) {
      const startParts = (s.startTime || '10:00').split(':').map(Number);
      const endParts = (s.endTime || '11:00').split(':').map(Number);
      const startMins = startParts[0] * 60 + (startParts[1] || 0);
      const endMins = endParts[0] * 60 + (endParts[1] || 0);

      if (endMins - startMins <= duration) {
        discreteSlots.push({ startTime: s.startTime, endTime: s.endTime });
      } else {
        for (let cur = startMins; cur + duration <= endMins; cur += duration) {
          const sh = Math.floor(cur / 60);
          const sm = cur % 60;
          const eh = Math.floor((cur + duration) / 60);
          const em = (cur + duration) % 60;
          discreteSlots.push({
            startTime: `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`,
            endTime: `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`,
          });
        }
      }
    }

    // Exclude already booked slots
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedConsultations = await Consultation.find({
      advocate: advocateUserId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $in: ['Pending', 'Confirmed'] },
    }).select('timeSlot');

    const bookedSlots = new Set(bookedConsultations.map((c) => c.timeSlot));

    const availableSlots = discreteSlots.map((slot) => ({
      ...slot,
      isBooked: bookedSlots.has(slot.startTime),
    }));

    return res.json({
      success: true,
      data: {
        slots: availableSlots,
        date,
        timezone: availability?.timezone || 'Asia/Kolkata',
        slotDuration: availability?.slotDuration || 60,
      },
    });
  }

  res.json({ success: true, data: availability || { weeklySchedule: [] } });
});


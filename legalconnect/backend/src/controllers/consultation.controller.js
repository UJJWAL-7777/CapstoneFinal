import { v4 as uuidv4 } from 'uuid';
import { Consultation } from '../models/Consultation.js';
import { Payment } from '../models/Payment.js';
import { AdvocateProfile } from '../models/AdvocateProfile.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { CONSULTATION_STATUS, ROLES, NOTIFICATION_TYPES, PAYMENT_STATUS } from '../constants/index.js';
import { createNotification } from '../services/notification.service.js';
import { logAudit } from '../services/audit.service.js';
import { checkAndAwardBadges } from '../services/badge.service.js';

function getIo(req) {
  return req.app.get('io');
}

export const createConsultation = asyncHandler(async (req, res) => {
  const { advocateId, date, timeSlot, duration, mode, legalIssue, practiceArea } = req.body;
  const io = getIo(req);

  // Resolve advocate profile and user ID
  const profile = await AdvocateProfile.findOne({
    $or: [{ user: advocateId }, { _id: advocateId }],
  });
  if (!profile) throw ApiError.notFound('Advocate not found');

  const advocateUserId = profile.user;

  // Validate date is not in the past
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (bookingDate < today) {
    throw ApiError.badRequest('Cannot schedule a consultation in the past');
  }

  const fee = profile.consultationFee || 0;

  // Check for double booking
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existing = await Consultation.findOne({
    advocate: advocateUserId,
    date: { $gte: startOfDay, $lte: endOfDay },
    timeSlot,
    status: { $in: [CONSULTATION_STATUS.PENDING, CONSULTATION_STATUS.CONFIRMED] },
  });
  if (existing) throw ApiError.conflict('This time slot has already been booked. Please choose another slot.');

  const consultation = await Consultation.create({
    client: req.user._id,
    advocate: advocateUserId,
    date: new Date(date),
    timeSlot,
    duration: duration || 60,
    mode: mode || 'video',
    legalIssue,
    practiceArea: practiceArea || profile.practiceAreas?.[0] || 'General Legal Advice',
    fee,
    videoRoomId: (mode === 'video' || !mode) ? uuidv4() : undefined,
  });

  // Create pending payment
  const payment = await Payment.create({
    consultation: consultation._id,
    client: req.user._id,
    advocate: advocateUserId,
    amount: fee,
    status: PAYMENT_STATUS.PENDING,
    platformFee: Math.round(fee * 0.1),
    advocateAmount: Math.round(fee * 0.9),
  });
  consultation.payment = payment._id;
  await consultation.save();

  await createNotification(io, {
    recipient: advocateUserId,
    type: NOTIFICATION_TYPES.BOOKING,
    title: 'New Consultation Request',
    message: `${req.user.name} has requested a ${mode || 'video'} consultation.`,
    link: `/advocate/consultations`,
    relatedEntity: { type: 'Consultation', id: consultation._id },
  });

  await logAudit({ actor: req.user._id, action: 'consultation.created', entityType: 'Consultation', entityId: consultation._id, req });

  const populated = await consultation.populate([
    { path: 'client', select: 'name email avatar phone' },
    { path: 'advocate', select: 'name email avatar phone' },
  ]);

  res.status(201).json({ success: true, data: { consultation: populated, payment } });
});

export const getConsultations = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = {};

  if (req.user.role === ROLES.CLIENT) query.client = req.user._id;
  else if (req.user.role === ROLES.ADVOCATE) query.advocate = req.user._id;

  if (status) query.status = status;

  const total = await Consultation.countDocuments(query);
  const consultations = await Consultation.find(query)
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('client', 'name email avatar')
    .populate('advocate', 'name email avatar')
    .populate('payment');

  res.json({
    success: true,
    data: { consultations, total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

export const getConsultation = asyncHandler(async (req, res) => {
  const consultation = await Consultation.findById(req.params.id)
    .populate('client', 'name email avatar phone')
    .populate('advocate', 'name email avatar phone')
    .populate('payment')
    .populate('case');

  if (!consultation) throw ApiError.notFound('Consultation not found');

  const participants = [String(consultation.client._id), String(consultation.advocate._id)];
  if (!participants.includes(String(req.user._id)) && req.user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden();
  }

  res.json({ success: true, data: consultation });
});

export const updateConsultationStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const io = getIo(req);
  const consultation = await Consultation.findById(req.params.id)
    .populate('client', 'name')
    .populate('advocate', 'name');

  if (!consultation) throw ApiError.notFound('Consultation not found');

  const isAdvocate = String(consultation.advocate._id) === String(req.user._id);
  const isClient = String(consultation.client._id) === String(req.user._id);

  // Role-based status transitions
  if (status === CONSULTATION_STATUS.CONFIRMED && !isAdvocate) throw ApiError.forbidden();
  if (status === CONSULTATION_STATUS.REJECTED && !isAdvocate) throw ApiError.forbidden();
  if (status === CONSULTATION_STATUS.CANCELLED && !isAdvocate && !isClient) throw ApiError.forbidden();
  if (status === CONSULTATION_STATUS.COMPLETED && !isAdvocate) throw ApiError.forbidden();
  if (status === CONSULTATION_STATUS.NO_SHOW && !isAdvocate) throw ApiError.forbidden();

  consultation.status = status;
  if (reason) {
    if (status === CONSULTATION_STATUS.REJECTED) consultation.rejectionReason = reason;
    if (status === CONSULTATION_STATUS.CANCELLED) {
      consultation.cancellationReason = reason;
      consultation.cancelledBy = req.user._id;
    }
  }
  if (status === CONSULTATION_STATUS.COMPLETED) consultation.completedAt = new Date();
  await consultation.save();

  // Notify the other party
  const notifyUserId = isAdvocate ? String(consultation.client._id) : String(consultation.advocate._id);
  const notifyType = status === CONSULTATION_STATUS.CONFIRMED
    ? NOTIFICATION_TYPES.BOOKING_CONFIRMED
    : status === CONSULTATION_STATUS.REJECTED
    ? NOTIFICATION_TYPES.BOOKING_REJECTED
    : NOTIFICATION_TYPES.CONSULTATION_CANCELLED;

  await createNotification(io, {
    recipient: notifyUserId,
    type: notifyType,
    title: `Consultation ${status}`,
    message: `Your consultation with ${isAdvocate ? consultation.advocate.name : consultation.client.name} has been ${status.toLowerCase()}.`,
    link: `/${req.user.role === ROLES.ADVOCATE ? 'client' : 'advocate'}/consultations`,
    relatedEntity: { type: 'Consultation', id: consultation._id },
  });

  // Update payment if cancelled/rejected
  if ([CONSULTATION_STATUS.CANCELLED, CONSULTATION_STATUS.REJECTED].includes(status)) {
    await Payment.findByIdAndUpdate(consultation.payment, { status: PAYMENT_STATUS.REFUNDED, refundedAt: new Date() });
  }

  // Check badges when consultation completed
  if (status === CONSULTATION_STATUS.COMPLETED) {
    const profile = await AdvocateProfile.findOne({ user: consultation.advocate._id });
    checkAndAwardBadges(io, consultation.advocate._id, profile).catch(() => {});
  }

  res.json({ success: true, data: consultation });
});

import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Payment } from '../models/Payment.js';
import { Consultation } from '../models/Consultation.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { PAYMENT_STATUS, ROLES, NOTIFICATION_TYPES } from '../constants/index.js';
import { createNotification } from '../services/notification.service.js';

function getIo(req) { return req.app.get('io'); }

// ── Razorpay client (lazy — only fails if keys are missing in production) ──
function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    // In dev/test with no keys, fall back to mock mode
    return null;
  }
  return new Razorpay({ key_id, key_secret });
}

// ── POST /api/payments/initiate ────────────────────────────────────────────
// Creates a Razorpay order (or mock order in dev) and returns order details
export const initiatePayment = asyncHandler(async (req, res) => {
  const { consultationId } = req.body;

  const consultation = await Consultation.findById(consultationId);
  if (!consultation) throw ApiError.notFound('Consultation not found');
  if (String(consultation.client) !== String(req.user._id)) throw ApiError.forbidden();

  const payment = await Payment.findById(consultation.payment);
  if (!payment) throw ApiError.notFound('Payment record not found');
  if (payment.status !== PAYMENT_STATUS.PENDING) {
    throw ApiError.badRequest('Payment already processed');
  }

  const razorpay = getRazorpay();

  if (!razorpay) {
    // ── MOCK MODE (no Razorpay keys set) ────────────────────────────
    payment.gatewayOrderId = `MOCK_ORDER_${Date.now()}`;
    await payment.save();
    return res.json({
      success: true,
      data: {
        orderId: payment.gatewayOrderId,
        amount: payment.amount,
        currency: 'INR',
        keyId: 'MOCK',
        paymentId: payment._id,
        mockMode: true,
      },
    });
  }

  // ── REAL RAZORPAY MODE ───────────────────────────────────────────
  const order = await razorpay.orders.create({
    amount: payment.amount * 100, // Razorpay uses paise (1 INR = 100 paise)
    currency: 'INR',
    receipt: `lc_${payment._id}`,
    notes: {
      consultationId: String(consultationId),
      paymentId: String(payment._id),
    },
  });

  payment.gatewayOrderId = order.id;
  await payment.save();

  res.json({
    success: true,
    data: {
      orderId: order.id,
      amount: payment.amount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
      mockMode: false,
    },
  });
});

// ── POST /api/payments/confirm ────────────────────────────────────────────
// Verifies Razorpay signature and marks payment successful
export const confirmPayment = asyncHandler(async (req, res) => {
  const { paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
  const io = getIo(req);

  const payment = await Payment.findById(paymentId).populate('consultation');
  if (!payment) throw ApiError.notFound('Payment not found');
  if (String(payment.client) !== String(req.user._id)) throw ApiError.forbidden();
  if (payment.status !== PAYMENT_STATUS.PENDING) {
    throw ApiError.badRequest('Payment already processed');
  }

  const razorpay = getRazorpay();

  if (!razorpay) {
    // ── MOCK MODE: skip verification ────────────────────────────────
    payment.status = PAYMENT_STATUS.SUCCESSFUL;
    payment.gatewayPaymentId = `MOCK_PAY_${Date.now()}`;
    payment.paidAt = new Date();
    payment.receiptNumber = `LC-RCP-${Date.now()}`;
  } else {
    // ── REAL MODE: verify HMAC signature ────────────────────────────
    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      throw ApiError.badRequest('Missing Razorpay payment details');
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw ApiError.badRequest('Payment verification failed — invalid signature');
    }

    payment.status = PAYMENT_STATUS.SUCCESSFUL;
    payment.gatewayPaymentId = razorpayPaymentId;
    payment.paidAt = new Date();
    payment.receiptNumber = `LC-RCP-${Date.now()}`;
  }

  await payment.save();

  // Update consultation status to Confirmed
  await Consultation.findByIdAndUpdate(payment.consultation, { status: 'Confirmed' });

  await createNotification(io, {
    recipient: payment.client,
    type: NOTIFICATION_TYPES.PAYMENT,
    title: 'Payment Successful',
    message: `Payment of ₹${payment.amount} confirmed. Receipt: ${payment.receiptNumber}`,
    link: '/client/consultations',
    relatedEntity: { type: 'Payment', id: payment._id },
  });

  res.json({ success: true, data: payment });
});

// ── GET /api/payments ─────────────────────────────────────────────────────
export const getPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, status } = req.query;
  const query = {};

  if (req.user.role === ROLES.CLIENT) query.client = req.user._id;
  else if (req.user.role === ROLES.ADVOCATE) query.advocate = req.user._id;

  if (status) query.status = status;

  const total = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('consultation', 'date timeSlot mode practiceArea legalIssue')
    .populate('client', 'name email avatar phone')
    .populate('advocate', 'name email avatar phone');

  const aggMatch = { status: PAYMENT_STATUS.SUCCESSFUL };
  if (req.user.role === ROLES.CLIENT) {
    aggMatch.client = new mongoose.Types.ObjectId(String(req.user._id));
  } else if (req.user.role === ROLES.ADVOCATE) {
    aggMatch.advocate = new mongoose.Types.ObjectId(String(req.user._id));
  }

  const sumField = req.user.role === ROLES.ADVOCATE ? '$advocateAmount' : '$amount';

  const totalRevenueAgg = await Payment.aggregate([
    { $match: aggMatch },
    { $group: { _id: null, total: { $sum: sumField }, platformFee: { $sum: '$platformFee' } } },
  ]);

  res.json({
    success: true,
    data: {
      payments,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      totalPlatformFee: totalRevenueAgg[0]?.platformFee || 0,
    },
  });
});

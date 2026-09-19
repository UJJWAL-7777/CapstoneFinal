import { Payment } from '../models/Payment.js';
import { Consultation } from '../models/Consultation.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { PAYMENT_STATUS, ROLES, NOTIFICATION_TYPES } from '../constants/index.js';
import { createNotification } from '../services/notification.service.js';

function getIo(req) {
  return req.app.get('io');
}

export const initiatePayment = asyncHandler(async (req, res) => {
  const { consultationId } = req.body;
  const consultation = await Consultation.findById(consultationId);
  if (!consultation) throw ApiError.notFound('Consultation not found');
  if (String(consultation.client) !== String(req.user._id)) throw ApiError.forbidden();

  const payment = await Payment.findById(consultation.payment);
  if (!payment) throw ApiError.notFound('Payment record not found');

  // Mock: generate a fake order ID
  payment.gatewayOrderId = `MOCK_ORDER_${Date.now()}`;
  await payment.save();

  res.json({
    success: true,
    data: {
      payment,
      mockMode: true,
      instructions: 'Use POST /api/payments/confirm with paymentId to simulate payment success',
    },
  });
});

export const confirmPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.body;
  const io = getIo(req);

  const payment = await Payment.findById(paymentId).populate('consultation');
  if (!payment) throw ApiError.notFound('Payment not found');
  if (String(payment.client) !== String(req.user._id)) throw ApiError.forbidden();
  if (payment.status !== PAYMENT_STATUS.PENDING) {
    throw ApiError.badRequest('Payment is not in pending state');
  }

  // Mock confirmation
  payment.status = PAYMENT_STATUS.SUCCESSFUL;
  payment.gatewayPaymentId = `MOCK_PAY_${Date.now()}`;
  payment.paidAt = new Date();
  payment.receiptNumber = `LC-RCP-${Date.now()}`;
  await payment.save();

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

export const getPayments = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === ROLES.CLIENT) query.client = req.user._id;
  else if (req.user.role === ROLES.ADVOCATE) query.advocate = req.user._id;

  const { page = 1, limit = 10 } = req.query;
  const total = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('consultation', 'date timeSlot mode')
    .populate('client', 'name')
    .populate('advocate', 'name');

  const totalRevenue = await Payment.aggregate([
    { $match: { ...query, status: PAYMENT_STATUS.SUCCESSFUL } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  res.json({
    success: true,
    data: { payments, total, page: Number(page), pages: Math.ceil(total / limit), totalRevenue: totalRevenue[0]?.total || 0 },
  });
});

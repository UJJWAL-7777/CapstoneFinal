import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../constants/index.js';

const paymentSchema = new mongoose.Schema(
  {
    consultation: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    advocate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    // Payment gateway fields (populated when integrated)
    gateway: { type: String, default: 'mock' }, // 'razorpay', 'stripe', 'mock'
    gatewayOrderId: String,
    gatewayPaymentId: String,
    gatewaySignature: String,
    receiptNumber: { type: String, unique: true, sparse: true },
    refundAmount: { type: Number, default: 0 },
    refundReason: String,
    refundedAt: Date,
    failureReason: String,
    paidAt: Date,
    // Platform fee breakdown
    platformFee: { type: Number, default: 0 },
    advocateAmount: { type: Number, default: 0 },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

paymentSchema.index({ client: 1, createdAt: -1 });
paymentSchema.index({ advocate: 1, createdAt: -1 });

export const Payment = mongoose.model('Payment', paymentSchema);

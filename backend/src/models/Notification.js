import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "case_update",
        "new_request",
        "request_accepted",
        "request_rejected",
        "badge_unlock",
        "tier_change",
        "system",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String }, // frontend route to navigate to
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for fast lookups
notificationSchema.index({ recipient: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);

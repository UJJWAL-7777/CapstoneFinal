import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    advocate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

// One review per client per case
reviewSchema.index({ client: 1, case: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);

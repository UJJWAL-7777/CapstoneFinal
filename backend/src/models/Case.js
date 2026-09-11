import mongoose from "mongoose";

const timelineEntrySchema = new mongoose.Schema({
  action: { type: String, required: true },
  description: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
});

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const caseSchema = new mongoose.Schema(
  {
    caseNumber: { type: String, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    caseType: {
      type: String,
      enum: [
        "Criminal",
        "Civil",
        "Family",
        "Property",
        "Corporate",
        "Labour",
        "Tax",
        "Consumer",
        "Constitutional",
        "Other",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "active", "in_progress", "resolved", "closed"],
      default: "pending",
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    advocate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    documents: [documentSchema],
    timeline: [timelineEntrySchema],

    outcome: { type: String, trim: true },
    fee: { type: Number, default: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Auto-generate case number before save
caseSchema.pre("save", async function (next) {
  if (!this.caseNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model("Case").countDocuments();
    this.caseNumber = `LC-${year}-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

export default mongoose.model("Case", caseSchema);

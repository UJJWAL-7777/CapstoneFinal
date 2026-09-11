import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    providerType: {
      type: String,
      enum: ["advocate", "arbitrator", "mediator", "notary", "document_writer"],
      required: true,
      default: "advocate",
    },

    specialization: [{ type: String, trim: true }], // e.g. ["Criminal", "Family"]

    enrollmentNumber: { type: String, trim: true }, // from Bar Council / regulatory data
    dateOfEnrollment: { type: Date },

    location: {
      state: { type: String, trim: true },
      district: { type: String, trim: true },
    },

    languages: [{ type: String, trim: true }],

    contact: {
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
    },

    verified: { type: Boolean, default: false },

    // --- Incentive / gamification fields (Section VI of the report) ---
    tier: {
      type: String,
      enum: ["Bronze", "Silver", "Gold", "Platinum"],
      default: "Bronze",
    },
    badges: [{ type: String }], // e.g. ["Community Impact", "Reliability Streak"]
    rating: { type: Number, min: 0, max: 5, default: 0 },
    engagementsCount: { type: Number, default: 0 },
    disputeRate: { type: Number, default: 0 }, // 0-1
    responseTimeHours: { type: Number, default: 24 },
    referralCount: { type: Number, default: 0 },
    signUpBonusCredited: { type: Boolean, default: false },

    underservedGeography: { type: Boolean, default: false },
    proBonoCases: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// text index so the discovery/search endpoint can query by name + specialization
providerSchema.index({ name: "text", specialization: "text" });

export default mongoose.model("Provider", providerSchema);

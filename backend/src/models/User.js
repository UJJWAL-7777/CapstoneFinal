import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },

    role: {
      type: String,
      enum: ["advocate", "client"],
      required: true,
    },

    phone: { type: String, trim: true },
    profilePicture: { type: String, default: "" },

    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },

    // If role === "advocate", link to the Provider document
    advocateProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT
userSchema.methods.generateToken = function () {
  const secret = process.env.JWT_SECRET || "legalconnect_jwt_secret_key_2026";
  return jwt.sign(
    { id: this._id, role: this.role, email: this.email },
    secret,
    { expiresIn: "7d" }
  );
};

export default mongoose.model("User", userSchema);

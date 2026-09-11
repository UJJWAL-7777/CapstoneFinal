import User from "../models/User.js";
import Provider from "../models/Provider.js";

// Helper: generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/register/advocate
export async function registerAdvocate(req, res) {
  try {
    const {
      name,
      email,
      password,
      phone,
      enrollmentNumber,
      dateOfEnrollment,
      specialization,
      state,
      district,
      languages,
      providerType,
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create Provider document
    const provider = new Provider({
      name,
      providerType: providerType || "advocate",
      enrollmentNumber,
      dateOfEnrollment,
      specialization: specialization || [],
      location: { state, district },
      languages: languages || [],
      contact: { phone, email },
    });
    await provider.save();

    // Generate OTP
    const otp = generateOTP();

    // Create User
    const user = new User({
      name,
      email,
      password,
      phone,
      role: "advocate",
      advocateProfile: provider._id,
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    });
    await user.save();

    // In production, send OTP via email/SMS. For dev, return in response.
    const token = user.generateToken();

    res.status(201).json({
      message: "Advocate registered successfully. Verify OTP to complete.",
      token,
      otp, // remove in production
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        advocateProfile: provider._id,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// POST /api/auth/register/client
export async function registerClient(req, res) {
  try {
    const { name, email, password, phone } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Generate OTP
    const otp = generateOTP();

    // Create User
    const user = new User({
      name,
      email,
      password,
      phone,
      role: "client",
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
    });
    await user.save();

    const token = user.generateToken();

    res.status(201).json({
      message: "Client registered successfully. Verify OTP to complete.",
      token,
      otp, // remove in production
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email }).populate("advocateProfile");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = user.generateToken();

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
        advocateProfile: user.advocateProfile || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/auth/verify-otp
export async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.json({ message: "Already verified" });
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // If advocate, also mark provider as verified
    if (user.role === "advocate" && user.advocateProfile) {
      await Provider.findByIdAndUpdate(user.advocateProfile, {
        verified: true,
      });
    }

    res.json({ message: "Verification successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/auth/forgot-password
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether user exists
      return res.json({ message: "If the email exists, a reset OTP has been sent." });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // In production, send via email
    res.json({
      message: "If the email exists, a reset OTP has been sent.",
      otp, // remove in production
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/auth/reset-password
export async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/auth/me
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -otp -otpExpiry")
      .populate("advocateProfile");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/auth/me
export async function updateProfile(req, res) {
  try {
    const { name, phone, profilePicture } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    // If advocate, also update provider name
    if (user.role === "advocate" && user.advocateProfile) {
      await Provider.findByIdAndUpdate(user.advocateProfile, {
        name: user.name,
        "contact.phone": user.phone,
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/auth/me/password
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

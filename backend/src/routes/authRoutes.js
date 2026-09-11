import { Router } from "express";
import {
  registerAdvocate,
  registerClient,
  login,
  verifyOTP,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

// Public routes
router.post("/register/advocate", registerAdvocate);
router.post("/register/client", registerClient);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/me", auth, getMe);
router.put("/me", auth, updateProfile);
router.put("/me/password", auth, changePassword);

export default router;

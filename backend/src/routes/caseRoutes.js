import { Router } from "express";
import {
  createCase,
  getCases,
  getCaseById,
  updateCaseStatus,
  addTimelineEntry,
  getCaseHistory,
  getRequests,
  acceptRequest,
  rejectRequest,
  getCaseStats,
} from "../controllers/caseController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

// All case routes require authentication
router.use(auth);

router.get("/stats", getCaseStats);
router.get("/history", getCaseHistory);
router.post("/", createCase);
router.get("/", getCases);
router.get("/:id", getCaseById);
router.put("/:id/status", updateCaseStatus);
router.post("/:id/timeline", addTimelineEntry);

export default router;

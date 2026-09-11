import { Router } from "express";
import { getRequests, acceptRequest, rejectRequest } from "../controllers/caseController.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(auth, requireRole("advocate"));

router.get("/", getRequests);
router.put("/:id/accept", acceptRequest);
router.put("/:id/reject", rejectRequest);

export default router;

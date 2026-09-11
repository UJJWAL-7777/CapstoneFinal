import { Router } from "express";
import { createReview, getAdvocateReviews } from "../controllers/reviewController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/advocate/:id", getAdvocateReviews); // public
router.post("/", auth, createReview); // auth required

export default router;

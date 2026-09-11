import { Router } from "express";
import {
  listProviders,
  getProvider,
  createProvider,
  recordEngagement,
  tierStats,
} from "../controllers/providerController.js";

const router = Router();

router.get("/stats/tiers", tierStats);
router.get("/", listProviders);
router.get("/:id", getProvider);
router.post("/", createProvider);
router.patch("/:id/engagement", recordEngagement);

export default router;

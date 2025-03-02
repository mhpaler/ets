import { Router } from "express";
import { enrichTarget, handleTargetWebhook } from "../controllers/targetController";
import { validateChainId } from "../middleware/chainIdValidator";

const router = Router();

router.post("/enrich", validateChainId, enrichTarget);
router.post("/webhook", validateChainId, handleTargetWebhook);

export default router;

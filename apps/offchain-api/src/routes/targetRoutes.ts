import { Router } from "express";
import { processTarget } from "../controllers/targetController";
import { validateChainId } from "../middleware/chainIdValidator";

const router = Router();

router.post("/enrich", validateChainId, processTarget);
// router.post("/webhook", validateChainId, handleTargetWebhook);

export default router;

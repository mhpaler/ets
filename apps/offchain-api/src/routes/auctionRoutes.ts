import { Router } from "express";
import { getNextAuction, handleAuctionWebhook } from "../controllers/auctionController";
import { validateChainId } from "../middleware/chainIdValidator";

const router = Router();

router.post("/next", validateChainId, getNextAuction);
router.post("/webhook", validateChainId, handleAuctionWebhook);

export default router;

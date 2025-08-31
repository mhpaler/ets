import { Router } from "express";
import { TagCoinController } from "../controllers/tagCoinController";
import type { IZoraService } from "../services/zora/IZoraService";
import { createZoraServiceFromEnv } from "../services/zora/zoraServiceProvider";

const router = Router();

// Initialize Zora service using provider (supports environment-based switching)
const initializeZoraService = (): IZoraService => {
  const privateKey = process.env.ETS_EOA_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    throw new Error("ETS_EOA_PRIVATE_KEY environment variable is required");
  }

  // Default to Base Sepolia testnet for development
  const chainId = process.env.CHAIN_ID ? Number.parseInt(process.env.CHAIN_ID) : 84532;

  // Metadata API URL (internal service call)
  const metadataApiUrl = process.env.METADATA_API_URL || "http://localhost:3000/api/metadata";

  // Use createZoraServiceFromEnv to create service based on ZORA_SERVICE_TYPE env var
  return createZoraServiceFromEnv(privateKey, chainId, metadataApiUrl);
};

// Initialize controller
const zoraService = initializeZoraService();
const tagCoinController = new TagCoinController(zoraService);

// Routes
router.post("/create", (req, res) => tagCoinController.createTagCoin(req, res));
router.get("/health", (req, res) => tagCoinController.healthCheck(req, res));
router.get("/config", (req, res) => tagCoinController.getConfig(req, res));
router.get("/:tagString", (req, res) => tagCoinController.getTagCoin(req, res));

export default router;

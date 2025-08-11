import { Router } from "express";
import { TagCoinController } from "../controllers/tagCoinController";
import { ZoraService } from "../services/zora/zoraService";

const router = Router();

// Initialize Zora service (TODO: move to dependency injection)
const initializeZoraService = (): ZoraService => {
  const privateKey = process.env.ETS_EOA_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    throw new Error("ETS_EOA_PRIVATE_KEY environment variable is required");
  }

  // Default to Base Sepolia testnet for development
  const chainId = process.env.CHAIN_ID ? Number.parseInt(process.env.CHAIN_ID) : 84532;

  // Metadata API URL (internal service call)
  const metadataApiUrl = process.env.METADATA_API_URL || "http://localhost:3000/api/metadata";

  return new ZoraService(privateKey, chainId, metadataApiUrl);
};

// Initialize controller
const zoraService = initializeZoraService();
const tagCoinController = new TagCoinController(zoraService);

// Routes
router.post("/create", (req, res) => tagCoinController.createTagCoin(req, res));
router.get("/health", (req, res) => tagCoinController.healthCheck(req, res));
router.get("/:tagString", (req, res) => tagCoinController.getTagCoin(req, res));

export default router;

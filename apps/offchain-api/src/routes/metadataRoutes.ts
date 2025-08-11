import { Router } from "express";
import { MetadataController } from "../controllers/metadataController";
import { TagMetadataService } from "../services/metadata/tagMetadataService";

const router = Router();

// Initialize metadata service in mock mode for testing
const initializeMetadataService = (): TagMetadataService => {
  const mockMode = process.env.METADATA_MOCK_MODE !== "false"; // Default to true
  const baseImageUrl = process.env.METADATA_IMAGE_BASE_URL || "https://ets.xyz/images/tags";
  const baseMetadataUrl = process.env.METADATA_BASE_URL || "https://ets.xyz/metadata/tags";

  return new TagMetadataService(mockMode, baseImageUrl, baseMetadataUrl);
};

// Initialize controller
const metadataService = initializeMetadataService();
const metadataController = new MetadataController(metadataService);

// Routes
router.post("/generate", (req, res) => metadataController.generateMetadata(req, res));
router.post("/validate", (req, res) => metadataController.validateMetadata(req, res));
router.get("/health", (req, res) => metadataController.healthCheck(req, res));
router.get("/:tagString", (req, res) => metadataController.getMetadata(req, res));

export default router;

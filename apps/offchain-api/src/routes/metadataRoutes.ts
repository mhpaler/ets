import { Router } from "express";
import { MetadataController } from "../controllers/metadataController";
import { TagMetadataService } from "../services/metadata/tagMetadataService";

const router = Router();

// Initialize metadata service
const initializeMetadataService = (): TagMetadataService => {
  const mockMode = process.env.METADATA_MOCK_MODE !== "false"; // Default to true
  const stagingMode = process.env.NODE_ENV === "staging";

  return new TagMetadataService(mockMode, stagingMode);
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

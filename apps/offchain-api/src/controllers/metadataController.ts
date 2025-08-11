import type { Request, Response } from "express";
import type { TagMetadataRequest, TagMetadataService } from "../services/metadata/tagMetadataService";
import { logger } from "../utils/logger";

export class MetadataController {
  private readonly metadataService: TagMetadataService;

  constructor(metadataService: TagMetadataService) {
    this.metadataService = metadataService;
  }

  /**
   * Generate metadata for a TAG coin
   * POST /api/metadata/generate
   */
  public async generateMetadata(req: Request, res: Response): Promise<void> {
    try {
      const request: TagMetadataRequest = req.body;

      // Validate required fields
      if (!this.isValidMetadataRequest(request)) {
        res.status(400).json({
          success: false,
          error: "Invalid metadata request",
          required: ["tagString", "machineName", "creator", "relayer"],
        });
        return;
      }

      logger.info("Received metadata generation request", {
        tagString: request.tagString,
        creator: request.creator,
      });

      // Generate metadata
      const result = await this.metadataService.generateMetadata(request);

      if (result.success) {
        // Validate the generated metadata
        if (result.metadata) {
          const validation = this.metadataService.validateMetadata(result.metadata);
          if (!validation.valid) {
            logger.warn("Generated metadata failed validation", {
              tagString: request.tagString,
              errors: validation.errors,
            });

            res.status(500).json({
              success: false,
              error: "Generated metadata failed validation",
              validationErrors: validation.errors,
            });
            return;
          }
        }

        res.status(200).json({
          success: true,
          metadataUri: result.metadataUri,
          metadata: result.metadata,
          message: "Metadata generated successfully",
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: "Failed to generate metadata",
        });
      }
    } catch (error) {
      logger.error("Error in generateMetadata controller", {
        error: error instanceof Error ? error.message : String(error),
      });

      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "Failed to process metadata generation request",
      });
    }
  }

  /**
   * Get metadata by tag (for existing metadata)
   * GET /api/metadata/:tagString
   */
  public async getMetadata(req: Request, res: Response): Promise<void> {
    try {
      const { tagString } = req.params;

      if (!tagString) {
        res.status(400).json({
          success: false,
          error: "Tag string is required",
        });
        return;
      }

      logger.info("Metadata lookup requested", { tagString });

      // TODO: Implement database lookup for existing metadata
      res.status(501).json({
        success: false,
        message: "Metadata lookup not implemented yet - requires database integration",
      });
    } catch (error) {
      logger.error("Error in getMetadata controller", {
        error: error instanceof Error ? error.message : String(error),
      });

      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Validate metadata JSON
   * POST /api/metadata/validate
   */
  public async validateMetadata(req: Request, res: Response): Promise<void> {
    try {
      const metadata = req.body;

      if (!metadata) {
        res.status(400).json({
          success: false,
          error: "Metadata JSON is required",
        });
        return;
      }

      logger.info("Metadata validation requested");

      const validation = this.metadataService.validateMetadata(metadata);

      res.status(200).json({
        success: true,
        valid: validation.valid,
        errors: validation.errors,
        message: validation.valid ? "Metadata is valid" : "Metadata validation failed",
      });
    } catch (error) {
      logger.error("Error in validateMetadata controller", {
        error: error instanceof Error ? error.message : String(error),
      });

      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Health check for metadata service
   * GET /api/metadata/health
   */
  public async healthCheck(_req: Request, res: Response): Promise<void> {
    try {
      // TODO: Add actual health checks (IPFS connectivity, image generation service, etc.)
      res.status(200).json({
        success: true,
        service: "metadata",
        status: "healthy",
        mockMode: true, // TODO: Get from service configuration
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Error in metadata health check", {
        error: error instanceof Error ? error.message : String(error),
      });

      res.status(500).json({
        success: false,
        service: "metadata",
        status: "unhealthy",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Validate metadata request structure
   */
  private isValidMetadataRequest(data: any): data is TagMetadataRequest {
    return (
      data &&
      typeof data.tagString === "string" &&
      typeof data.machineName === "string" &&
      typeof data.creator === "string" &&
      typeof data.relayer === "string"
    );
  }
}

export default MetadataController;

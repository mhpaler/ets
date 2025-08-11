import type { Request, Response } from "express";
import type { TagCreatedEventData, ZoraService } from "../services/zora/zoraService";
import { logger } from "../utils/logger";

export class TagCoinController {
  private readonly zoraService: ZoraService;

  constructor(zoraService: ZoraService) {
    this.zoraService = zoraService;
  }

  /**
   * Handle TAG coin creation request from oracle
   * POST /api/tag-coins/create
   */
  public async createTagCoin(req: Request, res: Response): Promise<void> {
    try {
      const eventData: TagCreatedEventData = req.body;

      // Validate required fields
      if (!this.isValidEventData(eventData)) {
        res.status(400).json({
          success: false,
          error: "Invalid event data",
          required: ["tagId", "tagString", "machineName", "creator", "relayer", "timestamp"],
        });
        return;
      }

      logger.info("Received TAG coin creation request", {
        tagId: eventData.tagId,
        tagString: eventData.tagString,
      });

      // Check for idempotency - has this coin already been created?
      const coinExists = await this.zoraService.coinExists(eventData);
      if (coinExists) {
        logger.info("TAG coin already exists", {
          tagString: eventData.tagString,
        });

        const coinAddress = await this.zoraService.predictCoinAddress(eventData);
        res.status(200).json({
          success: true,
          message: "Coin already exists",
          coinAddress,
          created: false,
        });
        return;
      }

      // Create the coin on Zora
      const result = await this.zoraService.createCoin(eventData);

      if (result.success) {
        res.status(201).json({
          success: true,
          message: "TAG coin created successfully",
          coinAddress: result.coinAddress,
          transactionHash: result.transactionHash,
          created: true,
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          message: "Failed to create TAG coin",
        });
      }
    } catch (error) {
      logger.error("Error in createTagCoin controller", {
        error: error instanceof Error ? error.message : String(error),
      });

      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "Failed to process TAG coin creation request",
      });
    }
  }

  /**
   * Get TAG coin information by tag
   * GET /api/tag-coins/:tagString
   */
  public async getTagCoin(req: Request, res: Response): Promise<void> {
    try {
      const { tagString } = req.params;

      if (!tagString) {
        res.status(400).json({
          success: false,
          error: "Tag string is required",
        });
        return;
      }

      // For now, we'll need to query our database for the coin address
      // TODO: Implement database lookup
      logger.info("TAG coin lookup requested", { tagString });

      res.status(501).json({
        success: false,
        message: "Not implemented yet - requires database integration",
      });
    } catch (error) {
      logger.error("Error in getTagCoin controller", {
        error: error instanceof Error ? error.message : String(error),
      });

      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Health check for TAG coin service
   * GET /api/tag-coins/health
   */
  public async healthCheck(_req: Request, res: Response): Promise<void> {
    try {
      // TODO: Add actual health checks (database, Zora connectivity, etc.)
      res.status(200).json({
        success: true,
        service: "tag-coins",
        status: "healthy",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Error in health check", {
        error: error instanceof Error ? error.message : String(error),
      });

      res.status(500).json({
        success: false,
        service: "tag-coins",
        status: "unhealthy",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Validate event data structure
   */
  private isValidEventData(data: any): data is TagCreatedEventData {
    return (
      data &&
      typeof data.tagId === "string" &&
      typeof data.tagString === "string" &&
      typeof data.machineName === "string" &&
      typeof data.creator === "string" &&
      typeof data.relayer === "string" &&
      typeof data.timestamp === "number"
    );
  }
}

export default TagCoinController;

import type { Request, Response } from "express";
import type { IZoraService, TagCreatedEventData } from "../services/zora/IZoraService";
import { logger } from "../utils/logger";

export class TagCoinController {
  private readonly zoraService: IZoraService;

  constructor(zoraService: IZoraService) {
    this.zoraService = zoraService;
  }

  /**
   * Handle TAG coin creation request from event processor
   * POST /api/tag-coin/create
   */
  public async createTagCoin(req: Request, res: Response): Promise<void> {
    try {
      // Extract event data from the request (event processor wraps it in { tagData, chainId })
      const { tagData, chainId } = req.body;
      const eventData: TagCreatedEventData = tagData;

      // Validate required fields
      if (!this.isValidEventData(eventData) || !chainId) {
        res.status(400).json({
          success: false,
          error: "Invalid event data",
          required: [
            "tagData.coinAddress",
            "tagData.originalInput",
            "tagData.machineName",
            "tagData.creator",
            "tagData.relayer",
            "tagData.timestamp",
            "chainId",
          ],
        });
        return;
      }

      logger.info("Received TAG coin creation request", {
        coinAddress: eventData.coinAddress,
        originalInput: eventData.originalInput,
        machineName: eventData.machineName,
        chainId,
      });

      // Check for idempotency - has this coin already been created?
      const coinExists = await this.zoraService.coinExists(eventData);
      if (coinExists) {
        logger.info("TAG coin already exists", {
          originalInput: eventData.originalInput,
          coinAddress: eventData.coinAddress,
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
          totalCostETH: result.totalCostETH,
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
      typeof data.coinAddress === "string" &&
      typeof data.originalInput === "string" &&
      typeof data.displayVersion === "string" &&
      typeof data.machineName === "string" &&
      typeof data.creator === "string" &&
      typeof data.relayer === "string" &&
      typeof data.timestamp === "string" &&
      typeof data.blockNumber === "string" &&
      typeof data.transactionHash === "string"
    );
  }

  /**
   * Get service configuration
   * GET /api/tag-coins/config
   */
  public async getConfig(_req: Request, res: Response): Promise<void> {
    try {
      const serviceType = process.env.ZORA_SERVICE_TYPE?.toUpperCase() || "SDK";
      const chainId = process.env.CHAIN_ID ? Number.parseInt(process.env.CHAIN_ID) : 84532;
      
      // Determine chain name
      let chainName: string;
      if (chainId === 8453) {
        chainName = "Base";
      } else if (chainId === 84532) {
        chainName = "Base Sepolia";
      } else if (chainId === 31337) {
        chainName = "Localhost";
      } else {
        chainName = "Unknown";
      }

      res.status(200).json({
        success: true,
        config: {
          serviceType,
          chainId,
          chainName,
          apiUrl: process.env.METADATA_API_URL || "http://localhost:3000/api/metadata",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Error in getConfig controller", {
        error: error instanceof Error ? error.message : String(error),
      });

      res.status(500).json({
        success: false,
        error: "Failed to get configuration",
      });
    }
  }
}

export default TagCoinController;

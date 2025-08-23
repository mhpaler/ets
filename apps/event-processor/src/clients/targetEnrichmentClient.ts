import axios, { type AxiosInstance } from "axios";
import { config } from "../config";
import type { TargetEnrichmentRequest, TargetEnrichmentResponse } from "../types";
import { getComponentLogger } from "../utils/logger";

export class TargetEnrichmentClient {
  private client: AxiosInstance;
  private readonly logger = getComponentLogger("TargetEnrichmentClient");

  constructor() {
    this.client = axios.create({
      baseURL: config.offchainApiUrl,
      timeout: 30000, // 30 seconds timeout for enrichment
      headers: {
        "Content-Type": "application/json",
        ...(config.offchainApiKey && { Authorization: `Bearer ${config.offchainApiKey}` }),
      },
    });
  }

  /**
   * Health check for the offchain API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get("/health");
      return response.status === 200;
    } catch (error) {
      this.logger.warn({ error }, "Target enrichment API health check failed");
      return false;
    }
  }

  /**
   * Enrich a target by calling the offchain API
   */
  async enrichTarget(targetId: string, chainId: number): Promise<TargetEnrichmentResponse> {
    try {
      this.logger.info({ targetId, chainId }, "🔍 Enriching target");

      const response = await this.client.post("/api/target/enrich", {
        targetId,
        chainId,
        returnType: "json", // We want JSON response, not Airnode format
      });

      if (response.status === 200 && response.data.success) {
        this.logger.info(
          {
            targetId,
            txId: response.data.data.txId,
            httpStatus: response.data.data.httpStatus,
          },
          "✅ Target enriched successfully",
        );

        return {
          success: true,
          txId: response.data.data.txId,
          httpStatus: response.data.data.httpStatus,
        };
      }

      this.logger.warn(
        {
          targetId,
          responseData: response.data,
        },
        "⚠️ Target enrichment failed",
      );

      return {
        success: false,
        error: response.data.message || "Unknown enrichment error",
      };
    } catch (error) {
      this.logger.error({ targetId, error }, "💥 Failed to enrich target");

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export const targetEnrichmentClient = new TargetEnrichmentClient();

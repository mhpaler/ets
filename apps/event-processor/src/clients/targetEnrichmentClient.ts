import axios, { type AxiosInstance } from "axios";
import { config } from "../config";
import type { TargetEnrichmentRequest, TargetEnrichmentResponse } from "../types";

export class TargetEnrichmentClient {
  private client: AxiosInstance;

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
      console.warn("Target enrichment API health check failed:", error);
      return false;
    }
  }

  /**
   * Enrich a target by calling the offchain API
   */
  async enrichTarget(targetId: string, chainId: number): Promise<TargetEnrichmentResponse> {
    try {
      console.log(`🔍 Enriching target ${targetId} on chain ${chainId}`);

      const response = await this.client.post("/api/target/enrich", {
        targetId,
        chainId,
        returnType: "json", // We want JSON response, not Airnode format
      });

      if (response.status === 200 && response.data.success) {
        console.log(`✅ Target ${targetId} enriched successfully`);
        return {
          success: true,
          txId: response.data.data.txId,
          httpStatus: response.data.data.httpStatus,
        };
      }

      console.warn(`⚠️ Target ${targetId} enrichment failed:`, response.data);
      return {
        success: false,
        error: response.data.message || "Unknown enrichment error",
      };
    } catch (error) {
      console.error(`💥 Failed to enrich target ${targetId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export const targetEnrichmentClient = new TargetEnrichmentClient();

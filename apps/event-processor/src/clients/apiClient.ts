import axios, { type AxiosInstance } from "axios";
import { config } from "../config";
import type { ZoraCoinCreationRequest, ZoraCoinCreationResponse } from "../types";
import { getComponentLogger } from "../utils/logger";

class ApiClient {
  private client: AxiosInstance;
  private readonly logger = getComponentLogger("ApiClient");

  constructor() {
    this.client = axios.create({
      baseURL: config.offchainApiUrl,
      timeout: 30000, // 30 second timeout
      headers: {
        "Content-Type": "application/json",
        ...(config.offchainApiKey && { Authorization: `Bearer ${config.offchainApiKey}` }),
      },
    });
  }

  /**
   * Request Zora coin creation for a tag
   */
  async createZoraCoin(request: ZoraCoinCreationRequest): Promise<ZoraCoinCreationResponse> {
    try {
      // Convert BigInts to strings for JSON serialization
      const serializedRequest = {
        ...request,
        tagData: {
          ...request.tagData,
          timestamp: request.tagData.timestamp.toString(),
          blockNumber: request.tagData.blockNumber.toString(),
        },
      };
      const response = await this.client.post("/api/tag-coin/create", serializedRequest);
      return response.data;
    } catch (error) {
      this.logger.error({ error }, "Failed to create Zora coin");
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Health check for the off-chain API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get("/health");
      return response.status === 200;
    } catch (error) {
      this.logger.error({ error }, "API health check failed");
      return false;
    }
  }
}

export const apiClient = new ApiClient();

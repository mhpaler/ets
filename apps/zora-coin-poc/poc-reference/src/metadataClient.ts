/**
 * Metadata Client for Zora Content Coin Creation
 *
 * Uses the existing ETS offchain-api metadata service to generate
 * valid metadata URIs for Zora content coins.
 */

import type { TagMetadataRequest } from "./types.js";

export interface MetadataResponse {
  success: boolean;
  metadataUri?: string;
  createMetadataParameters?: {
    name: string;
    symbol: string;
    uri: `ipfs://${string}`;
  };
  metadata?: any;
  error?: string;
  message?: string;
}

export class MetadataClient {
  private readonly apiBaseUrl: string;

  constructor(apiBaseUrl = "http://localhost:4000") {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Generate metadata for a tag using the offchain-api service
   */
  async generateTagMetadata(request: TagMetadataRequest): Promise<MetadataResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/metadata/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = (await response.json()) as MetadataResponse;
      return result;
    } catch (error) {
      console.error("Failed to generate metadata:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Check if the offchain-api is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/metadata/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Create a tag metadata request for the POC
   */
  createPOCTagRequest(smartWalletAddress: `0x${string}`): TagMetadataRequest {
    const timestamp = Date.now();
    const tagString = `#ZoraPOC${timestamp}`;

    return {
      tagString,
      machineName: tagString.toLowerCase().replace("#", ""),
      creator: smartWalletAddress,
      relayer: smartWalletAddress, // For POC, creator and relayer are the same
    };
  }
}

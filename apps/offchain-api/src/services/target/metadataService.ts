import axios from "axios";
import { unfurl } from "unfurl.js";
import { logger } from "../../utils/logger";
import { arweaveService } from "../shared/arweaveService";

export class MetadataService {
  /**
   * Extract metadata from a URL
   * @param url The URL to extract metadata from
   */
  public async extractMetadata(url: string): Promise<any> {
    try {
      logger.info(`Extracting metadata from URL: ${url}`);

      // Use unfurl.js to extract rich metadata
      const result = await unfurl(url);

      // Format the metadata
      const metadata = {
        url,
        title: result.title || "",
        description: result.description || "",
        favicon: result.favicon || "",
        openGraph: result.open_graph || {},
        twitter: result.twitter_card || {},
        extractedAt: new Date().toISOString(),
      };

      logger.info(`Metadata extracted successfully from ${url}`);
      return metadata;
    } catch (error) {
      logger.error(`Failed to extract metadata from ${url}:`, error);

      // Return minimal metadata with error information
      return {
        url,
        error: error instanceof Error ? error.message : "Unknown error",
        extractedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Process a target URL: extract metadata and upload to Arweave
   * @param targetId The target ID
   * @param targetUrl The target URL to process
   * @returns Arweave transaction ID
   */
  public async processTargetUrl(
    targetId: string,
    targetUrl: string,
  ): Promise<{
    txId: string;
    httpStatus: number;
    metadata: any;
  }> {
    try {
      // First check if the URL is accessible
      let httpStatus = 200;
      try {
        const response = await axios.head(targetUrl);
        httpStatus = response.status;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          httpStatus = error.response.status;
        } else {
          httpStatus = 500;
        }
      }

      // Extract metadata
      const metadata = await this.extractMetadata(targetUrl);

      // Upload to Arweave
      const txId = await arweaveService.uploadTargetMetadata(targetId, metadata);

      return { txId, httpStatus, metadata };
    } catch (error) {
      logger.error(`Failed to process target URL ${targetUrl}:`, error);
      throw new Error(`Failed to process target URL: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}

export const metadataService = new MetadataService();

import axios from "axios";
import { unfurl } from "unfurl.js";
import { logger } from "../../utils/logger";
import { arweaveService } from "../shared/arweaveService";

// Base interface for all metadata extractors
interface MetadataExtractor {
  extract(url: string): Promise<any>;
}

// HTML metadata extractor using unfurl.js
class HtmlMetadataExtractor implements MetadataExtractor {
  async extract(url: string): Promise<any> {
    try {
      logger.info({ url }, "Extracting HTML metadata");
      const result = await unfurl(url);

      return {
        url,
        contentType: "text/html",
        title: result.title || "",
        description: result.description || "",
        favicon: result.favicon || "",
        openGraph: result.open_graph || {},
        twitter: result.twitter_card || {},
        extractedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(
        {
          url,
          error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
        },
        "Failed to extract HTML metadata",
      );

      return {
        url,
        contentType: "text/html",
        error: error instanceof Error ? error.message : "Unknown error",
        extractedAt: new Date().toISOString(),
      };
    }
  }
}

// Image metadata extractor
class ImageMetadataExtractor implements MetadataExtractor {
  async extract(url: string): Promise<any> {
    try {
      logger.info({ url }, "Extracting image metadata");

      // For now, we're just extracting basic information
      // Later we could use image processing libraries to get dimensions, etc.
      return {
        url,
        contentType: "image",
        title: this.extractFilenameFromUrl(url),
        isImage: true,
        extractedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(
        {
          url,
          error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
        },
        "Failed to extract image metadata",
      );

      return {
        url,
        contentType: "image",
        error: error instanceof Error ? error.message : "Unknown error",
        extractedAt: new Date().toISOString(),
      };
    }
  }

  private extractFilenameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split("/").pop() || "";
      // Remove query parameters if present
      return filename.split("?")[0];
    } catch {
      return "Unknown Image";
    }
  }
}

// Generic fallback extractor for unsupported content types
class GenericMetadataExtractor implements MetadataExtractor {
  async extract(url: string): Promise<any> {
    logger.info({ url }, "Using generic metadata extraction");
    return {
      url,
      contentType: "unknown",
      title: url,
      extractedAt: new Date().toISOString(),
    };
  }
}

export class MetadataService {
  /**
   * Detect the content type of a URL
   * @param url The URL to check
   */
  private async detectContentType(url: string): Promise<string> {
    try {
      logger.info({ url }, "Detecting content type");
      const response = await axios.head(url);
      const contentType = response.headers["content-type"] || "";
      logger.info({ url, contentType }, "Detected content type");
      return contentType.toLowerCase();
    } catch (error) {
      logger.error(
        {
          url,
          error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
        },
        "Failed to detect content type",
      );

      // Default to HTML if we can't detect
      return "text/html";
    }
  }

  /**
   * Get the appropriate metadata extractor for a content type
   * @param contentType The detected content type
   */
  private getMetadataExtractor(contentType: string): MetadataExtractor {
    if (contentType.includes("text/html") || contentType.includes("application/xhtml+xml")) {
      return new HtmlMetadataExtractor();
    }
    if (contentType.startsWith("image/")) {
      return new ImageMetadataExtractor();
    }
    // Use the generic extractor as a fallback
    return new GenericMetadataExtractor();
  }

  /**
   * Extract metadata from a URL based on its content type
   * @param url The URL to extract metadata from
   */
  public async extractMetadata(url: string): Promise<any> {
    try {
      logger.info({ url }, "Starting metadata extraction");

      // Detect the content type
      const contentType = await this.detectContentType(url);

      // Get the appropriate extractor
      const extractor = this.getMetadataExtractor(contentType);

      // Extract the metadata
      const metadata = await extractor.extract(url);

      logger.info({ url }, "Metadata extracted successfully");
      return metadata;
    } catch (error) {
      logger.error(
        {
          url,
          error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
        },
        "Failed to extract metadata",
      );

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
    txId: string | null; // Now can be null when scraping fails
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

      // Check if metadata contains an error (scraping failed)
      if (metadata.error) {
        logger.warn(
          {
            targetId,
            targetUrl,
            error: metadata.error,
          },
          "Skipping Arweave upload due to scraping failure",
        );

        // Set appropriate error status code
        httpStatus = 422; // Unprocessable Entity - good code for "could connect but couldn't process"
        return { txId: null, httpStatus, metadata };
      }

      // Only upload to Arweave if scraping succeeded
      const txId = await arweaveService.uploadTargetMetadata(targetId, metadata);

      return { txId, httpStatus, metadata };
    } catch (error) {
      logger.error(
        {
          targetId,
          targetUrl,
          error:
            error instanceof Error
              ? {
                  message: error.message,
                  stack: error.stack,
                  name: error.name,
                }
              : String(error),
        },
        "Failed to process target URL",
      );

      throw new Error(`Failed to process target URL: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}

export const metadataService = new MetadataService();

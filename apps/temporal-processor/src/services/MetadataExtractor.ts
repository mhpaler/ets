import { unfurl } from "unfurl.js";
import type { ETSTargetMetadata, MetadataType, Platform } from "../types/metadata.js";
import { createErrorMetadata, createMinimalMetadata } from "../types/metadata.js";
import { getComponentLogger } from "../utils/logger.js";

const logger = getComponentLogger("MetadataExtractor");

export class MetadataExtractor {
  private readonly timeout: number;
  private readonly maxSize: number;

  constructor(options = { timeout: 10000, maxSize: 5 * 1024 * 1024 }) {
    this.timeout = options.timeout;
    this.maxSize = options.maxSize;
  }

  /**
   * Extract metadata from a URI
   */
  async extract(uri: string): Promise<ETSTargetMetadata> {
    try {
      // Validate URI
      const _url = this.validateUrl(uri);

      // Use unfurl to extract metadata
      logger.info(`Extracting metadata for: ${uri}`);

      const result = await unfurl(uri, {
        oembed: true,
        timeout: this.timeout,
        size: this.maxSize,
        follow: 5, // Max redirects
        headers: {
          "User-Agent": "ETS-Bot/1.0 (Ethereum Tag Service; +https://ets.xyz)",
        },
      });

      // Transform unfurl result to our metadata structure
      return this.transformMetadata(uri, result);
    } catch (error) {
      logger.error({ error, uri }, "Failed to extract metadata");

      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes("timeout")) {
          return createErrorMetadata(uri, "Request timeout", 408);
        }
        if (error.message.includes("Invalid URL")) {
          return createErrorMetadata(uri, "Invalid URL format", 400);
        }
        if (error.message.includes("404")) {
          return createErrorMetadata(uri, "Page not found", 404);
        }

        return createErrorMetadata(uri, error.message, 0);
      }

      return createErrorMetadata(uri, "Unknown error", 0);
    }
  }

  /**
   * Validate and normalize URL
   */
  private validateUrl(uri: string): URL {
    try {
      const url = new URL(uri);

      // Check for valid protocols
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error(`Unsupported protocol: ${url.protocol}`);
      }

      // Block internal IPs (SSRF prevention)
      if (this.isInternalIP(url.hostname)) {
        throw new Error("Internal IP addresses not allowed");
      }

      return url;
    } catch (_error) {
      throw new Error(`Invalid URL: ${uri}`);
    }
  }

  /**
   * Check if hostname is an internal IP
   */
  private isInternalIP(hostname: string): boolean {
    const parts = hostname.split(".");
    if (parts.length !== 4) return false;

    const [a, b] = parts.map(Number);

    // Check for private IP ranges
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 127) return true; // 127.0.0.0/8 (localhost)

    return false;
  }

  /**
   * Transform unfurl result to our metadata structure
   */
  private transformMetadata(uri: string, unfurlResult: any): ETSTargetMetadata {
    const url = new URL(uri);

    // Determine extraction method
    let extractionMethod: ETSTargetMetadata["core"]["extractionMethod"] = "fallback";
    if (unfurlResult.open_graph) {
      extractionMethod = "opengraph";
    } else if (unfurlResult.twitter_card) {
      extractionMethod = "twitter";
    } else if (unfurlResult.title || unfurlResult.description) {
      extractionMethod = "html";
    }

    // Extract core fields
    const core: ETSTargetMetadata["core"] = {
      uri,
      title: this.extractTitle(unfurlResult, url),
      description: this.extractDescription(unfurlResult),
      image: this.extractImage(unfurlResult, url),
      favicon: this.extractFavicon(unfurlResult, url),
      httpStatus: 200, // Unfurl succeeded, so assume 200
      contentType: unfurlResult.content_type || "text/html",
      language: this.extractLanguage(unfurlResult),
      extractedAt: new Date().toISOString(),
      extractionMethod,
    };

    // Determine content type and platform
    const type = this.determineType(unfurlResult, url);
    const platform = this.determinePlatform(url);

    // Extract keywords
    const keywords = this.extractKeywords(unfurlResult);

    // Build extensions
    const extensions = this.buildExtensions(unfurlResult, url);

    return {
      core,
      type,
      platform,
      keywords: keywords.length > 0 ? keywords : undefined,
      extensions: Object.keys(extensions).length > 0 ? extensions : undefined,
    };
  }

  private extractTitle(result: any, url: URL): string {
    return result.open_graph?.title || result.twitter_card?.title || result.title || url.hostname;
  }

  private extractDescription(result: any): string {
    return result.open_graph?.description || result.twitter_card?.description || result.description || "";
  }

  private extractImage(result: any, url: URL): string | null {
    const image =
      result.open_graph?.images?.[0]?.url ||
      result.twitter_card?.images?.[0]?.url ||
      result.oEmbed?.thumbnail_url ||
      null;

    // Ensure absolute URL
    if (image && !image.startsWith("http")) {
      try {
        return new URL(image, url.origin).href;
      } catch {
        return null;
      }
    }

    return image;
  }

  private extractFavicon(result: any, url: URL): string | null {
    if (result.favicon) {
      // Ensure absolute URL
      if (!result.favicon.startsWith("http")) {
        try {
          return new URL(result.favicon, url.origin).href;
        } catch {
          return `${url.origin}/favicon.ico`;
        }
      }
      return result.favicon;
    }

    return `${url.origin}/favicon.ico`;
  }

  private extractLanguage(result: any): string {
    return result.open_graph?.locale?.split("_")[0] || result.lang || "unknown";
  }

  private determineType(result: any, url: URL): MetadataType {
    // Check OpenGraph type
    const ogType = result.open_graph?.type;
    if (ogType) {
      if (ogType.includes("video")) return "video";
      if (ogType.includes("article")) return "article";
      if (ogType.includes("profile")) return "profile";
      if (ogType.includes("image")) return "image";
    }

    // Check platform-specific patterns
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();

    // Social posts
    if (hostname.includes("twitter.com") || hostname.includes("x.com")) {
      if (pathname.includes("/status/")) return "social_post";
    }
    if (hostname.includes("warpcast.com")) return "social_post";
    if (hostname.includes("lenster.xyz")) return "social_post";

    // Repositories
    if (hostname.includes("github.com")) {
      if (!pathname.includes("/issues/") && !pathname.includes("/pull/")) {
        return "repository";
      }
    }

    // Videos
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      return "video";
    }
    if (hostname.includes("vimeo.com")) return "video";

    // Documents
    if (pathname.endsWith(".pdf")) return "document";
    if (pathname.endsWith(".doc") || pathname.endsWith(".docx")) return "document";

    // Images
    if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return "image";

    // NFTs
    if (hostname.includes("opensea.io") || hostname.includes("rarible.com")) {
      return "nft";
    }

    // Default to article for text content
    if (result.title && result.description) {
      return "article";
    }

    return "unknown";
  }

  private determinePlatform(url: URL): Platform | undefined {
    const hostname = url.hostname.toLowerCase();

    if (hostname.includes("github.com")) return "github";
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) return "youtube";
    if (hostname.includes("twitter.com") || hostname.includes("x.com")) return "twitter";
    if (hostname.includes("warpcast.com")) return "farcaster";
    if (hostname.includes("lenster.xyz")) return "lens";
    if (hostname.includes("medium.com")) return "medium";
    if (hostname.includes("wikipedia.org")) return "wikipedia";

    return undefined;
  }

  private extractKeywords(result: any): string[] {
    const keywords: string[] = [];

    // From meta keywords
    if (result.keywords && typeof result.keywords === "string") {
      keywords.push(...result.keywords.split(",").map((k: string) => k.trim()));
    }

    // From OpenGraph
    if (result.open_graph?.article?.tags) {
      keywords.push(...result.open_graph.article.tags);
    }

    // From Twitter
    if (result.twitter_card?.labels) {
      for (const label of Object.values(result.twitter_card.labels)) {
        if (typeof label === "string") {
          keywords.push(label);
        }
      }
    }

    // Deduplicate and limit
    return [...new Set(keywords)].slice(0, 10);
  }

  private buildExtensions(result: any, _url: URL): any {
    const extensions: any = {};

    // Creator info
    if (result.open_graph?.article?.author || result.author || result.oEmbed?.author_name) {
      extensions.creator = {
        name: result.open_graph?.article?.author || result.author || result.oEmbed?.author_name,
        url: result.oEmbed?.author_url,
      };
    }

    // Dates
    if (result.open_graph?.article?.published_time || result.open_graph?.article?.modified_time) {
      extensions.dates = {
        published: result.open_graph?.article?.published_time,
        modified: result.open_graph?.article?.modified_time,
      };
    }

    // Media info
    if (result.oEmbed?.type === "video" || result.open_graph?.type === "video") {
      extensions.media = {
        duration: result.open_graph?.video?.duration,
        width: result.oEmbed?.width || result.open_graph?.video?.width,
        height: result.oEmbed?.height || result.open_graph?.video?.height,
      };
    }

    // Platform-specific metrics (would need API calls for real data)
    // For MVP, we're just structuring the data

    return extensions;
  }
}

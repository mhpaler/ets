/**
 * ETS Target Metadata Types
 * Based on the specification in docs/session/METADATA-EXTRACTION-SPEC.md
 */

export interface ETSTargetMetadata {
  // Core fields (always present)
  core: {
    uri: string;
    title: string;
    description: string;
    image: string | null;
    favicon: string | null;
    httpStatus: number;
    contentType: string;
    language: string;
    extractedAt: string; // ISO 8601
    extractionMethod: "opengraph" | "json-ld" | "twitter" | "html" | "fallback" | "error";
  };

  // Content classification
  type: MetadataType;

  // Platform identification
  platform?: Platform;

  // Keywords for searchability
  keywords?: string[];

  // Type-specific extensions
  extensions?: MetadataExtensions;
}

export type MetadataType =
  | "article"
  | "video"
  | "image"
  | "document"
  | "profile"
  | "repository"
  | "nft"
  | "social_post"
  | "unknown";

export type Platform = "github" | "youtube" | "twitter" | "farcaster" | "lens" | "medium" | "wikipedia" | "custom";

export interface MetadataExtensions {
  // Author/creator info
  creator?: {
    name?: string;
    url?: string;
    handle?: string;
    verified?: boolean;
  };

  // Temporal context
  dates?: {
    published?: string; // ISO 8601
    modified?: string; // ISO 8601
  };

  // Media info
  media?: {
    duration?: number; // seconds
    width?: number;
    height?: number;
    size?: number; // bytes
    thumbnails?: string[];
  };

  // Platform metrics
  metrics?: {
    views?: number;
    likes?: number;
    stars?: number;
    forks?: number;
    reposts?: number;
    replies?: number;
  };

  // Social context
  context?: {
    isReply?: boolean;
    threadId?: string;
    quotedPost?: string;
    channel?: string;
  };
}

/**
 * Create a default metadata object for error cases
 */
export function createErrorMetadata(uri: string, error: string, httpStatus = 0): ETSTargetMetadata {
  return {
    core: {
      uri,
      title: "Error fetching metadata",
      description: error,
      image: null,
      favicon: null,
      httpStatus,
      contentType: "unknown",
      language: "unknown",
      extractedAt: new Date().toISOString(),
      extractionMethod: "error",
    },
    type: "unknown",
  };
}

/**
 * Create a minimal metadata object with defaults
 */
export function createMinimalMetadata(uri: string, httpStatus: number, contentType: string): ETSTargetMetadata {
  const url = new URL(uri);
  return {
    core: {
      uri,
      title: url.hostname,
      description: "",
      image: null,
      favicon: `${url.protocol}//${url.hostname}/favicon.ico`,
      httpStatus,
      contentType,
      language: "unknown",
      extractedAt: new Date().toISOString(),
      extractionMethod: "fallback",
    },
    type: "unknown",
  };
}

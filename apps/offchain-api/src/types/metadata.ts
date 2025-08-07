/**
 * Base interface for all metadata types
 */
export interface BaseMetadata {
  url: string;
  contentType: string;
  extractedAt: string;
  error?: string;
  schemaVersion: string; // e.g., "1.0", "1.1", etc.
}

/**
 * HTML metadata schema
 */
export interface HtmlMetadata extends BaseMetadata {
  contentType: "text/html" | "application/xhtml+xml";
  title?: string;
  description?: string;
  favicon?: string;
  openGraph?: Record<string, any>;
  twitter?: Record<string, any>;
}

/**
 * Image metadata schema
 */
export interface ImageMetadata extends BaseMetadata {
  contentType: string; // Will be 'image/jpeg', 'image/png', etc.
  title?: string;
  isImage: true;
  dimensions?: {
    width?: number;
    height?: number;
  };
  fileSize?: number;
}

/**
 * Generic fallback metadata schema
 */
export interface GenericMetadata extends BaseMetadata {
  contentType: string;
  title?: string;
}

/**
 * Union type of all possible metadata types
 */
export type Metadata = HtmlMetadata | ImageMetadata | GenericMetadata;

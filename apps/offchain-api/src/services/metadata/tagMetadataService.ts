import {
  createMetadataBuilder,
  createZoraUploaderForCreator,
  getURLFromUploadResult,
  setApiKey,
  validateImageMimeType,
} from "@zoralabs/coins-sdk";
import { logger } from "../../utils/logger";

export interface TagMetadataRequest {
  tagString: string;
  machineName: string;
  creator: string;
  relayer: string;
}

export interface TagMetadataResponse {
  success: boolean;
  metadataUri?: string;
  createMetadataParameters?: {
    name: string;
    symbol: string;
    uri: `ipfs://${string}`;
  };
  metadata?: any;
  error?: string;
}

export class TagMetadataService {
  private readonly mockMode: boolean;
  private readonly stagingMode: boolean;

  constructor(mockMode = true, stagingMode = false) {
    this.mockMode = mockMode;
    this.stagingMode = stagingMode;

    // Set Zora API key for IPFS uploads
    if (!mockMode) {
      const zoraApiKey = process.env.ZORA_API_KEY;
      if (!zoraApiKey || zoraApiKey === "your_zora_api_key_here") {
        logger.warn("Zora API key not configured - real IPFS uploads will fail", {
          hasKey: !!zoraApiKey,
          isPlaceholder: zoraApiKey === "your_zora_api_key_here",
        });
      } else {
        setApiKey(zoraApiKey);
        logger.info("Zora API key configured for IPFS uploads");
      }
    }
  }

  /**
   * Generate complete metadata for a TAG coin using Zora metadata builder
   */
  public async generateMetadata(request: TagMetadataRequest): Promise<TagMetadataResponse> {
    try {
      logger.info("Generating TAG metadata with Zora builder", {
        tagString: request.tagString,
        mockMode: this.mockMode,
        stagingMode: this.stagingMode,
      });

      if (this.mockMode) {
        // In mock mode, return fake metadata without actual uploads
        return await this.generateMockMetadata(request);
      }

      // Use Zora metadata builder for real IPFS uploads
      return await this.generateRealMetadata(request);
    } catch (error) {
      logger.error("Failed to generate TAG metadata", {
        tagString: request.tagString,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate mock metadata for testing (no actual uploads)
   */
  private async generateMockMetadata(request: TagMetadataRequest): Promise<TagMetadataResponse> {
    const canonicalName = this.toCanonicalName(request.tagString);
    const mockImageUri = this.createMockImageUrl(request);
    const mockMetadataUri = this.createMockMetadataUri(request);

    const mockMetadata = {
      name: `TAG: ${canonicalName}`,
      symbol: "ETS",
      description: `TAG coin for ${request.tagString} - Created via ETS`,
      image: mockImageUri,
      properties: this.buildETSProperties(request),
    };

    logger.info("Generated mock metadata", {
      tagString: request.tagString,
      metadataUri: mockMetadataUri,
    });

    return {
      success: true,
      metadataUri: mockMetadataUri,
      metadata: mockMetadata,
      createMetadataParameters: {
        name: mockMetadata.name,
        symbol: mockMetadata.symbol,
        uri: mockMetadataUri as `ipfs://${string}`,
      },
    };
  }

  /**
   * Generate real metadata using Zora metadata builder with IPFS uploads
   */
  private async generateRealMetadata(request: TagMetadataRequest): Promise<TagMetadataResponse> {
    const canonicalName = this.toCanonicalName(request.tagString);
    const imageFile = await this.generateImageFile(request);

    // Create uploader for the creator's address
    const uploader = createZoraUploaderForCreator(request.creator as `0x${string}`);

    // Build metadata with Zora builder
    const builder = createMetadataBuilder()
      .withName(`TAG: ${canonicalName}`)
      .withSymbol("ETS")
      .withDescription(`TAG coin for ${request.tagString} - Created via ETS`)
      .withImage(imageFile)
      .withProperties(this.buildETSProperties(request));

    // Upload to IPFS via Zora's infrastructure
    const result = await builder.upload(uploader);

    logger.info("Generated real metadata via Zora", {
      tagString: request.tagString,
      metadataUri: result.url,
      stagingMode: this.stagingMode,
    });

    return {
      success: true,
      metadataUri: result.url,
      metadata: result.metadata,
      createMetadataParameters: result.createMetadataParameters,
    };
  }

  /**
   * Create mock image URL for testing
   */
  private createMockImageUrl(request: TagMetadataRequest): string {
    // Generate deterministic mock image URL
    const cleanTag = request.tagString.replace("#", "").toLowerCase();
    const hash = this.simpleHash(cleanTag);

    // Use placeholder service for consistent mock images
    return `https://via.placeholder.com/400x400/0066CC/FFFFFF?text=${encodeURIComponent(request.tagString)}&hash=${hash}`;
  }

  /**
   * Create mock metadata URI for testing
   */
  private createMockMetadataUri(request: TagMetadataRequest): string {
    // Generate deterministic mock IPFS URI
    const hash = this.simpleHash(request.tagString + request.creator);
    return `ipfs://QmMock${hash}`;
  }

  /**
   * Build ETS-specific properties for the metadata
   */
  private buildETSProperties(request: TagMetadataRequest): Record<string, string> {
    return {
      category: "tag",
      platform: "ETS",
      creator: request.creator,
      relayer: request.relayer,
      original_tag: request.tagString,
      machine_name: request.machineName,
      tag_type: this.getTagType(request.tagString),
      created_timestamp: new Date().toISOString(),
      symbol: "ETS",
    };
  }

  /**
   * Generate image file for the tag (placeholder implementation)
   * TODO: Replace with actual image generation
   */
  private async generateImageFile(request: TagMetadataRequest): Promise<File> {
    // For now, create a simple SVG as placeholder
    const svgContent = this.generatePlaceholderSVG(request);
    const blob = new Blob([svgContent], { type: "image/svg+xml" });

    // Create File object that Zora builder expects
    const fileName = `tag-${request.machineName}.svg`;
    return new File([blob], fileName, { type: "image/svg+xml" });
  }

  /**
   * Generate placeholder SVG image for tag
   * TODO: Replace with proper image generation system
   */
  private generatePlaceholderSVG(request: TagMetadataRequest): string {
    const cleanTag = request.tagString.replace("#", "");
    const color = this.getTagColor(request.tagString);

    return `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="${color}"/>
      <text x="200" y="200" text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial, sans-serif" font-size="48" fill="white">
        ${cleanTag}
      </text>
      <text x="200" y="350" text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial, sans-serif" font-size="16" fill="white" opacity="0.8">
        ETS TAG Coin
      </text>
    </svg>`;
  }

  /**
   * Get color for tag based on content
   */
  private getTagColor(tagString: string): string {
    const colors = ["#0066CC", "#FF6B35", "#7209B7", "#2F9B69", "#C1666B"];
    const hash = this.simpleHash(tagString);
    return colors[Number.parseInt(hash.slice(0, 2), 16) % colors.length];
  }

  /**
   * Convert tag string to canonical name
   */
  private toCanonicalName(tagString: string): string {
    const cleanTag = tagString.startsWith("#") ? tagString.slice(1) : tagString;

    // Only title case ASCII, preserve Unicode
    if (/^[a-zA-Z0-9_\s-]+$/.test(cleanTag)) {
      return cleanTag
        .split(/[\s-]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
    }

    return cleanTag;
  }

  /**
   * Determine tag type for attributes
   */
  private getTagType(tagString: string): string {
    const cleanTag = tagString.replace("#", "");

    if (/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(cleanTag)) {
      return "Emoji";
    }

    // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional Unicode detection
    if (/[^\x00-\x7F]/.test(cleanTag)) {
      return "Unicode";
    }

    if (cleanTag.includes("-") || cleanTag.includes("_")) {
      return "Compound";
    }

    if (/^[A-Z]+$/.test(cleanTag)) {
      return "Acronym";
    }

    return "Standard";
  }

  /**
   * Simple hash function for deterministic mock data
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, "0");
  }
}

export default TagMetadataService;

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
  metadata?: TagMetadataJson;
  error?: string;
}

export interface TagMetadataJson {
  version: string;
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  external_url: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export class TagMetadataService {
  private readonly mockMode: boolean;
  private readonly baseImageUrl: string;
  private readonly baseMetadataUrl: string;

  constructor(
    mockMode = true,
    baseImageUrl = "https://ets.xyz/images/tags",
    baseMetadataUrl = "https://ets.xyz/metadata/tags",
  ) {
    this.mockMode = mockMode;
    this.baseImageUrl = baseImageUrl;
    this.baseMetadataUrl = baseMetadataUrl;
  }

  /**
   * Generate complete metadata for a TAG coin
   */
  public async generateMetadata(request: TagMetadataRequest): Promise<TagMetadataResponse> {
    try {
      logger.info("Generating TAG metadata", {
        tagString: request.tagString,
        mockMode: this.mockMode,
      });

      // Generate the metadata JSON
      const metadata = await this.buildMetadataJson(request);

      if (this.mockMode) {
        // In mock mode, return the metadata with a mock URI
        const metadataUri = await this.createMockMetadataUri(request, metadata);

        logger.info("Generated mock metadata", {
          tagString: request.tagString,
          metadataUri,
        });

        return {
          success: true,
          metadataUri,
          metadata,
        };
      }
      // In production mode, upload to IPFS and return real URI
      const metadataUri = await this.uploadToIPFS(metadata);

      logger.info("Generated production metadata", {
        tagString: request.tagString,
        metadataUri,
      });

      return {
        success: true,
        metadataUri,
        metadata,
      };
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
   * Build the metadata JSON structure
   */
  private async buildMetadataJson(request: TagMetadataRequest): Promise<TagMetadataJson> {
    const canonicalName = this.toCanonicalName(request.tagString);
    const imageUrl = await this.generateImageUrl(request);

    return {
      version: "zora-20210101",
      name: `TAG: ${canonicalName}`,
      description: `TAG coin for ${request.tagString} - Created via ETS`,
      image: imageUrl,
      external_url: `https://ets.xyz/tags/${request.machineName}`,
      attributes: [
        {
          trait_type: "Original Format",
          value: request.tagString,
        },
        {
          trait_type: "Creator",
          value: request.creator,
        },
        {
          trait_type: "Machine Name",
          value: request.machineName,
        },
        {
          trait_type: "Created Via",
          value: "ETS",
        },
        {
          trait_type: "Symbol",
          value: "ETS",
        },
        {
          trait_type: "Tag Type",
          value: this.getTagType(request.tagString),
        },
      ],
    };
  }

  /**
   * Generate image URL for the tag
   */
  private async generateImageUrl(request: TagMetadataRequest): Promise<string> {
    if (this.mockMode) {
      // Return mock image URL
      return this.createMockImageUrl(request);
    }
    // TODO: Implement actual image generation and IPFS upload
    return await this.generateAndUploadImage(request);
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
  private async createMockMetadataUri(request: TagMetadataRequest, _metadata: TagMetadataJson): Promise<string> {
    // Generate deterministic mock metadata URI
    const hash = this.simpleHash(request.tagString + request.creator);
    return `${this.baseMetadataUrl}/mock/${hash}.json`;
  }

  /**
   * Upload metadata to IPFS (production implementation)
   */
  private async uploadToIPFS(metadata: TagMetadataJson): Promise<string> {
    // TODO: Implement actual IPFS upload
    logger.warn("IPFS upload not yet implemented, using mock URI");
    const hash = this.simpleHash(JSON.stringify(metadata));
    return `ipfs://QmMockHash${hash}`;
  }

  /**
   * Generate and upload image (production implementation)
   */
  private async generateAndUploadImage(request: TagMetadataRequest): Promise<string> {
    // TODO: Implement actual image generation
    // This would:
    // 1. Generate SVG or PNG image for the tag
    // 2. Handle Unicode/emoji rendering
    // 3. Upload to IPFS
    // 4. Return IPFS URL

    logger.warn("Image generation not yet implemented, using mock URL");
    return this.createMockImageUrl(request);
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

  /**
   * Validate metadata against Zora schema
   */
  public validateMetadata(metadata: TagMetadataJson): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!metadata.version) errors.push("version is required");
    if (!metadata.name) errors.push("name is required");
    if (!metadata.image) errors.push("image is required");

    // Version format
    if (metadata.version && !metadata.version.match(/^[a-z]+-\d{8}$/)) {
      errors.push('version must be in format "name-YYYYMMDD"');
    }

    // Attributes structure
    if (metadata.attributes) {
      metadata.attributes.forEach((attr, index) => {
        if (!attr.trait_type) errors.push(`attributes[${index}].trait_type is required`);
        if (attr.value === undefined || attr.value === null) {
          errors.push(`attributes[${index}].value is required`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default TagMetadataService;

import { DeployCurrency, type ValidMetadataURI, createCoin } from "@zoralabs/coins-sdk";
import axios from "axios";
import { http, type Address, createPublicClient, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { logger } from "../../utils/logger";

export interface TagCreatedEventData {
  tagId: string;
  tagString: string;
  machineName: string;
  creator: string;
  relayer: string;
  timestamp: number;
}

export interface TagMetadataRequest {
  tagString: string;
  machineName: string;
  creator: string;
  relayer: string;
}

export interface ZoraCoinCreationResult {
  success: boolean;
  coinAddress?: Address;
  transactionHash?: `0x${string}`;
  blockNumber?: bigint;
  error?: string;
}

export class ZoraService {
  private readonly walletClient: any;
  private readonly publicClient: any;
  private readonly account: any;
  private readonly chainId: number;
  private readonly metadataApiUrl: string;

  constructor(
    privateKey: `0x${string}`,
    chainId = 8453, // Base mainnet
    metadataApiUrl = "http://localhost:3000/api/metadata",
  ) {
    // Select chain
    const chain = chainId === 84532 ? baseSepolia : base;
    this.chainId = chainId;
    this.metadataApiUrl = metadataApiUrl;

    // Create account from private key (ensure 0x prefix)
    const formattedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
    this.account = privateKeyToAccount(formattedKey as `0x${string}`);

    // Create clients
    this.publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    this.walletClient = createWalletClient({
      account: this.account,
      chain,
      transport: http(),
    });

    // Note: The @zoralabs/coins-sdk doesn't have a client instance
    // We'll use the static functions directly with our walletClient
  }

  /**
   * Generate metadata via metadata API
   */
  private async generateMetadata(
    eventData: TagCreatedEventData,
  ): Promise<{
    success: boolean;
    metadataUri?: string;
    createMetadataParameters?: {
      name: string;
      symbol: string;
      uri: `ipfs://${string}`;
    };
    error?: string;
  }> {
    try {
      const request: TagMetadataRequest = {
        tagString: eventData.tagString,
        machineName: eventData.machineName,
        creator: eventData.creator,
        relayer: eventData.relayer,
      };

      logger.info("Calling metadata API", {
        tagString: eventData.tagString,
        apiUrl: `${this.metadataApiUrl}/generate`,
      });

      const response = await axios.post(`${this.metadataApiUrl}/generate`, request, {
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        return {
          success: true,
          metadataUri: response.data.metadataUri,
        };
      }
      return {
        success: false,
        error: response.data.error || "Metadata generation failed",
      };
    } catch (error) {
      logger.error("Metadata API call failed", {
        tagString: eventData.tagString,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Metadata API call failed",
      };
    }
  }

  /**
   * Create a new TAG coin on Zora platform
   */
  public async createCoin(eventData: TagCreatedEventData): Promise<ZoraCoinCreationResult> {
    try {
      logger.info("Creating TAG coin on Zora", {
        tagString: eventData.tagString,
        creator: eventData.creator,
      });

      // Check if coin already exists
      const exists = await this.coinExists(eventData);
      if (exists) {
        const coinAddress = await this.predictCoinAddress(eventData);
        logger.info("TAG coin already exists", {
          tagString: eventData.tagString,
          coinAddress,
        });
        return {
          success: true,
          coinAddress,
          transactionHash: "0x0" as `0x${string}`, // Placeholder for existing coin
        };
      }

      // Generate metadata via metadata API
      const metadataResult = await this.generateMetadata(eventData);
      if (!metadataResult.success || !metadataResult.metadataUri) {
        throw new Error(`Metadata generation failed: ${metadataResult.error}`);
      }

      // Use metadata parameters from Zora builder if available, otherwise fallback to manual construction
      const name = metadataResult.createMetadataParameters?.name || this.toCanonicalName(eventData.tagString.slice(1));
      const symbol = metadataResult.createMetadataParameters?.symbol || "ETS";
      const uri = metadataResult.createMetadataParameters?.uri || metadataResult.metadataUri;

      // Create coin using Zora SDK
      const result = await createCoin(
        {
          name,
          symbol,
          uri: uri as ValidMetadataURI,
          payoutRecipient: eventData.creator as Address,
          platformReferrer: eventData.relayer as Address,
          chainId: this.chainId,
          currency: this.chainId === 84532 ? DeployCurrency.ETH : DeployCurrency.ZORA, // ETH on testnet, ZORA on mainnet
        },
        this.walletClient,
        this.publicClient,
      );

      logger.info("Successfully created TAG coin", {
        tagString: eventData.tagString,
        coinAddress: result.address,
        txHash: result.transactionHash,
        blockNumber: result.blockNumber,
      });

      return {
        success: true,
        coinAddress: result.address,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
      };
    } catch (error) {
      logger.error("Failed to create TAG coin", {
        tagString: eventData.tagString,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Predict the coin address for a given tag (using Zora's deterministic deployment)
   */
  public async predictCoinAddress(eventData: TagCreatedEventData): Promise<Address> {
    // TODO: Implement Zora's address prediction using their SDK
    // For now, return a placeholder - the SDK might provide this functionality
    const canonicalName = this.toCanonicalName(eventData.tagString.slice(1));

    // This would be implemented using Zora's deterministic addressing
    // Placeholder implementation
    const hash = `0x${canonicalName
      .toLowerCase()
      .split("")
      .map((c) => c.charCodeAt(0).toString(16))
      .join("")
      .padEnd(40, "0")}`;
    return hash as Address;
  }

  /**
   * Check if a coin already exists for a given tag
   */
  public async coinExists(eventData: TagCreatedEventData): Promise<boolean> {
    try {
      const predictedAddress = await this.predictCoinAddress(eventData);
      const bytecode = await this.publicClient.getBytecode({ address: predictedAddress });
      return bytecode !== undefined && bytecode !== "0x";
    } catch (error) {
      logger.error("Error checking coin existence", { error });
      return false;
    }
  }

  /**
   * Convert tag string to canonical name format
   */
  private toCanonicalName(tagString: string): string {
    // Only title case ASCII characters, preserve Unicode as-is
    if (/^[a-zA-Z0-9_\s]+$/.test(tagString)) {
      return tagString
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
    }

    // Preserve Unicode/emoji as-is
    return tagString;
  }

  /**
   * Create coin parameters for testing/validation (legacy method)
   */
  public async createCoinParams(eventData: TagCreatedEventData): Promise<any> {
    // This method is kept for backward compatibility with tests
    // In production, metadata is generated via API
    const metadataResult = await this.generateMetadata(eventData);

    return {
      name: this.toCanonicalName(eventData.tagString.slice(1)),
      symbol: "ETS",
      recipient: eventData.creator,
      referrer: eventData.relayer,
      metadataUri: metadataResult.metadataUri,
      metadata: {
        // Placeholder for testing
        description: `TAG coin for ${eventData.tagString} - Created via ETS`,
        attributes: [
          { trait_type: "Original Format", value: eventData.tagString },
          { trait_type: "Creator", value: eventData.creator },
          { trait_type: "Machine Name", value: eventData.machineName },
          { trait_type: "Created Via", value: "ETS" },
        ],
      },
    };
  }
}

export default ZoraService;

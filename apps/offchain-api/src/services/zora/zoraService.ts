import { CreateConstants, createCoin } from "@zoralabs/coins-sdk";
import axios from "axios";
import { http, type Address, createPublicClient, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { logger } from "../../utils/logger";

export interface TagCreatedEventData {
  coinAddress: string; // Predicted Zora coin address from ETS contract
  originalInput: string; // Exact user input (e.g., "#TestTag")
  displayVersion: string; // Canonical display format (e.g., "#TestTag")
  machineName: string; // Normalized identifier (e.g., "testtag")
  creator: string; // Address credited with creating the TAG
  relayer: string; // Address of relayer that facilitated creation
  timestamp: string; // Block timestamp (converted from BigInt)
  blockNumber: string; // Block number (converted from BigInt)
  transactionHash: string; // Transaction hash that created the TAG
}

export interface TagMetadataRequest {
  originalInput: string; // Changed from tagString to match event data
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
  private readonly isLocalhostMode: boolean;

  constructor(
    privateKey: `0x${string}`,
    chainId = 8453, // Base mainnet
    metadataApiUrl = "http://localhost:3000/api/metadata",
  ) {
    // Select chain
    const chain = chainId === 84532 ? baseSepolia : base;
    this.chainId = chainId;
    this.metadataApiUrl = metadataApiUrl;

    logger.info(
      `ZoraService constructor - chainId: ${chainId}, chainName: ${chain.name}, chainIdFromChain: ${chain.id}`,
    );

    // Check if we're in localhost development mode
    this.isLocalhostMode = chainId === 31337 || process.env.NODE_ENV === "development";

    // Create account from private key (ensure 0x prefix)
    const formattedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
    this.account = privateKeyToAccount(formattedKey as `0x${string}`);

    // Create clients with Alchemy RPC URL using API key
    const alchemyApiKey = process.env.ALCHEMY_API_KEY;
    if (!alchemyApiKey) {
      throw new Error("ALCHEMY_API_KEY environment variable is required");
    }

    const rpcUrl =
      chainId === 84532
        ? `https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
        : `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;

    this.publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    }) as any;

    this.walletClient = createWalletClient({
      account: this.account,
      chain,
      transport: http(rpcUrl),
    }) as any;

    // Ensure chain is properly set (viem sometimes doesn't attach it correctly)
    if (!this.publicClient.chain) {
      logger.warn("publicClient.chain was undefined, manually setting it");
      this.publicClient.chain = chain;
    }
    if (!this.walletClient.chain) {
      logger.warn("walletClient.chain was undefined, manually setting it");
      this.walletClient.chain = chain;
    }

    // Double-check chain object structure matches expected viem format
    logger.info(
      `After chain setup - publicClient.chain.id: ${this.publicClient.chain?.id}, walletClient.chain.id: ${this.walletClient.chain?.id}`,
    );
    logger.info(`Chain object keys: ${Object.keys(this.publicClient.chain || {}).join(", ")}`);
    logger.info(
      `Chain name: ${this.publicClient.chain?.name}, nativeCurrency: ${this.publicClient.chain?.nativeCurrency?.symbol}`,
    );

    // Note: The @zoralabs/coins-sdk doesn't have a client instance
    // We'll use the static functions directly with our walletClient
  }

  /**
   * Generate metadata via metadata API
   */
  private async generateMetadata(eventData: TagCreatedEventData): Promise<{
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
      const request = {
        tagString: eventData.originalInput, // Metadata API expects tagString
        machineName: eventData.machineName,
        creator: eventData.creator,
        relayer: eventData.relayer,
      };

      logger.info("Calling metadata API", {
        originalInput: eventData.originalInput,
        apiUrl: `${this.metadataApiUrl}/generate`,
      });

      const response = await axios.post(`${this.metadataApiUrl}/generate`, request, {
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.INTERNAL_API_KEY || "local-dev-key",
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
        originalInput: eventData.originalInput,
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
        originalInput: eventData.originalInput,
        coinAddress: eventData.coinAddress,
        creator: eventData.creator,
        isLocalhostMode: this.isLocalhostMode,
      });

      // Verify signing account is properly configured
      logger.info("🔐 Verifying signing account configuration:");
      logger.info(`   Account address: ${this.account.address}`);
      logger.info(`   WalletClient account: ${this.walletClient.account?.address}`);
      logger.info(`   Account type: ${this.account.type}`);
      logger.info(`   Has signMessage: ${typeof this.account.signMessage === "function"}`);
      logger.info(`   Has signTransaction: ${typeof this.account.signTransaction === "function"}`);

      // Verify chain configuration
      logger.info("⛓️ Chain configuration:");
      logger.info(`   Chain ID: ${this.chainId}`);
      logger.info(`   PublicClient chain: ${this.publicClient.chain?.name} (${this.publicClient.chain?.id})`);
      logger.info(`   WalletClient chain: ${this.walletClient.chain?.name} (${this.walletClient.chain?.id})`);

      // Check account balance (optional but useful for debugging)
      try {
        const balance = await this.publicClient.getBalance({
          address: this.account.address,
        });
        logger.info(`   Account balance: ${balance} wei (${Number(balance) / 1e18} ETH)`);
      } catch (balanceError) {
        logger.warn(`   Could not fetch balance: ${balanceError}`);
      }

      // In localhost mode, return deterministic mock response
      if (this.isLocalhostMode) {
        logger.info("Localhost mode: Returning mock Zora coin creation", {
          originalInput: eventData.originalInput,
          coinAddress: eventData.coinAddress,
        });

        // Generate deterministic mock transaction hash based on tag data
        const mockTxHash = this.generateMockTransactionHash(eventData);

        return {
          success: true,
          coinAddress: eventData.coinAddress as Address,
          transactionHash: mockTxHash,
          blockNumber: BigInt(Number.parseInt(eventData.blockNumber) + 1), // Mock next block
        };
      }

      // Check if coin already exists using the predicted address from ETS contract
      const exists = await this.coinExists(eventData);
      if (exists) {
        logger.info("TAG coin already exists", {
          originalInput: eventData.originalInput,
          coinAddress: eventData.coinAddress,
        });
        return {
          success: true,
          coinAddress: eventData.coinAddress as Address,
          transactionHash: "0x0" as `0x${string}`, // Placeholder for existing coin
        };
      }

      // Generate real metadata via metadata API
      logger.info("Generating metadata via metadata API", {
        originalInput: eventData.originalInput,
      });

      const metadataResult = await this.generateMetadata(eventData);
      if (!metadataResult.success || !metadataResult.metadataUri) {
        throw new Error(`Metadata generation failed: ${metadataResult.error}`);
      }

      logger.info("Metadata generation successful", {
        originalInput: eventData.originalInput,
        metadataUri: metadataResult.metadataUri,
      });

      // Use the generated metadata URI
      const tagWithoutHash = eventData.originalInput.startsWith("#")
        ? eventData.originalInput.slice(1)
        : eventData.originalInput;
      const name = `TAG: ${this.toCanonicalName(tagWithoutHash)}`;
      const symbol = "TAGS";
      const uri = metadataResult.metadataUri;

      // Debug logging before createCoin
      logger.info(`About to call createCoin SDK - chainId: ${this.chainId}`);
      logger.info(`publicClient.chain exists: ${!!this.publicClient.chain}`);
      logger.info(`publicClient.chain.id: ${this.publicClient.chain?.id}`);
      logger.info(`walletClient.chain exists: ${!!this.walletClient.chain}`);
      logger.info(`walletClient.chain.id: ${this.walletClient.chain?.id}`);

      // Additional debug - check if chain IDs match expected values
      logger.info(`Expected Base Sepolia ID: 84532, actual: ${this.publicClient.chain?.id}`);
      logger.info(`Chain ID type: ${typeof this.publicClient.chain?.id}`);

      // Manually test the validation logic
      const { base: baseChain, baseSepolia: baseSepoliaChain } = await import("viem/chains");
      logger.info(`Imported baseSepolia.id: ${baseSepoliaChain.id}, base.id: ${baseChain.id}`);
      logger.info(`Manual validation - matches baseSepolia: ${this.publicClient.chain?.id === baseSepoliaChain.id}`);
      logger.info(`Manual validation - matches base: ${this.publicClient.chain?.id === baseChain.id}`);

      // Final debug - log the exact objects being passed to SDK
      logger.info(`Final SDK call - publicClient.chain.id: ${this.publicClient.chain?.id}`);
      logger.info(`Final SDK call - walletClient.chain.id: ${this.walletClient.chain?.id}`);

      // Log the exact parameters we're sending to SDK
      console.log("🔍 SDK Parameters being sent:");
      console.log(`   creator: ${eventData.creator}`);
      console.log(`   name: ${name}`);
      console.log(`   symbol: ${symbol}`);
      console.log(`   uri: ${uri}`);
      console.log("   currency: ZORA");
      console.log(`   chainId: ${this.chainId}`);
      console.log(`   platformReferrer: ${eventData.relayer}`);
      console.log("   skipMetadataValidation: true");

      // Create coin using Zora SDK (correct format)
      try {
        /*
          {
            creator: eventData.creator as Address,
            name,
            symbol,
            metadata: {
              type: "RAW_URI" as const,
              uri: uri,
            },
            currency: CreateConstants.ContentCoinCurrencies.ZORA,
            chainId: this.chainId,
            platformReferrer: eventData.relayer as Address,
            skipMetadataValidation: true, // Skip validation to avoid timeout
          },
          */

        const args = {
          creator: eventData.creator as Address,
          name: name,
          symbol: symbol,
          metadata: { type: "RAW_URI" as const, uri: uri },
          currency: CreateConstants.ContentCoinCurrencies.ETH,
          chainId: this.chainId,
          startingMarketCap: CreateConstants.StartingMarketCaps.LOW,
          platformReferrerAddress: eventData.relayer as Address,
        };

        const result = await createCoin({
          call: args,
          walletClient: this.walletClient,
          publicClient: this.publicClient,
        });

        logger.info("Successfully created TAG coin", {
          originalInput: eventData.originalInput,
          coinAddress: result.address,
          txHash: result.hash,
          deployment: result.deployment,
        });

        return {
          success: true,
          coinAddress: result.address,
          transactionHash: result.hash,
          blockNumber: result.deployment?.blockNumber,
        };
      } catch (sdkError: any) {
        logger.error(`SDK createCoin error: ${sdkError.message}`);
        logger.error(`Stack trace: ${sdkError.stack?.split("\n").slice(0, 5).join(" | ")}`);
        throw sdkError;
      }
    } catch (error) {
      logger.error("Failed to create TAG coin", {
        originalInput: eventData.originalInput,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get the predicted coin address from ETS contract (already computed)
   */
  public async predictCoinAddress(eventData: TagCreatedEventData): Promise<Address> {
    // The ETS contract already computed the deterministic address using computeCoinAddress(machineName)
    // We just return what was provided in the event data
    return eventData.coinAddress as Address;
  }

  /**
   * Check if a coin already exists for a given tag
   */
  public async coinExists(eventData: TagCreatedEventData): Promise<boolean> {
    try {
      const bytecode = await this.publicClient.getBytecode({ address: eventData.coinAddress as Address });
      return bytecode !== undefined && bytecode !== "0x";
    } catch (error) {
      logger.error("Error checking coin existence", {
        coinAddress: eventData.coinAddress,
        error: error instanceof Error ? error.message : String(error),
      });
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
   * Generate deterministic mock transaction hash for localhost testing
   */
  private generateMockTransactionHash(eventData: TagCreatedEventData): `0x${string}` {
    // Create deterministic hash based on tag data
    const input = `MOCK_ZORA_TX_${eventData.machineName}_${eventData.creator}_${eventData.timestamp}`;

    // Simple hash function (for testing only)
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // Convert to hex and pad to 64 characters
    const hexHash = Math.abs(hash).toString(16).padStart(8, "0");
    return `0x${"MOCK".charCodeAt(0).toString(16)}${hexHash.repeat(8).slice(0, 60)}` as `0x${string}`;
  }

  /**
   * Create coin parameters for testing/validation (legacy method)
   */
  public async createCoinParams(eventData: TagCreatedEventData): Promise<any> {
    // This method is kept for backward compatibility with tests
    // In production, metadata is generated via API
    const metadataResult = await this.generateMetadata(eventData);

    // Remove # prefix from originalInput for the name
    const tagWithoutHash = eventData.originalInput.startsWith("#")
      ? eventData.originalInput.slice(1)
      : eventData.originalInput;

    return {
      name: this.toCanonicalName(tagWithoutHash),
      symbol: "TAGS",
      recipient: eventData.creator,
      referrer: eventData.relayer,
      metadataUri: metadataResult.metadataUri,
      metadata: {
        // Placeholder for testing
        description: `TAG coin for ${eventData.originalInput} - Created via ETS`,
        attributes: [
          { trait_type: "Original Format", value: eventData.originalInput },
          { trait_type: "Display Version", value: eventData.displayVersion },
          { trait_type: "Creator", value: eventData.creator },
          { trait_type: "Machine Name", value: eventData.machineName },
          { trait_type: "Created Via", value: "ETS" },
          { trait_type: "Block Number", value: eventData.blockNumber },
          { trait_type: "Transaction Hash", value: eventData.transactionHash },
        ],
      },
    };
  }
}

export default ZoraService;

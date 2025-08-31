import axios from "axios";
import { http, type Address, createPublicClient, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { logger } from "../../utils/logger";
import type { IZoraService, TagCreatedEventData, ZoraCoinCreationResult } from "./IZoraService";
import { ZoraFactoryService } from "./zoraFactoryService";

export interface TagMetadataRequest {
  originalInput: string; // Changed from tagString to match event data
  machineName: string;
  creator: string;
  relayer: string;
}

/**
 * Zora service using direct factory interaction for deterministic coin creation
 */
export class ZoraContractsService implements IZoraService {
  private readonly walletClient: any;
  private readonly publicClient: any;
  private readonly account: any;
  private readonly chainId: number;
  private readonly metadataApiUrl: string;
  private readonly zoraFactory: ZoraFactoryService;

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

    // Create clients with Alchemy RPC URL using API key
    const alchemyApiKey = process.env.ALCHEMY_API_KEY;
    if (!alchemyApiKey) {
      throw new Error("ALCHEMY_API_KEY environment variable is required");
    }

    const rpcUrl =
      chainId === 84532
        ? `https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
        : `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;

    // Create clients
    this.publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    this.walletClient = createWalletClient({
      account: this.account,
      chain,
      transport: http(rpcUrl),
    });

    // Initialize Zora factory service
    this.zoraFactory = new ZoraFactoryService(this.publicClient, this.walletClient, chainId);

    logger.info(
      `ZoraContractsService initialized - chainId: ${chainId}, chainName: ${chain.name}, chainIdFromChain: ${chain.id}`,
    );
  }

  /**
   * Predict coin address using same parameters as ETS contract
   */
  public async predictCoinAddress(eventData: TagCreatedEventData): Promise<Address> {
    const coinSalt = this.zoraFactory.generateCoinSalt(eventData.machineName);
    const poolConfig = this.zoraFactory.getStandardPoolConfig();

    return await this.zoraFactory.predictCoinAddress({
      msgSender: this.account.address,
      name: eventData.originalInput,
      symbol: "TAGS",
      poolConfig,
      platformReferrer: this.account.address, // TODO: Get from ETS contract configuration
      coinSalt,
    });
  }

  /**
   * Create a new TAG coin on Zora platform using direct factory interaction
   */
  public async createCoin(eventData: TagCreatedEventData): Promise<ZoraCoinCreationResult> {
    try {
      logger.info("Creating TAG coin via Zora factory", {
        originalInput: eventData.originalInput,
        predictedAddress: eventData.coinAddress,
        creator: eventData.creator,
        machineName: eventData.machineName,
      });

      // Validate that our prediction matches ETS contract prediction
      /*
      const ourPrediction = await this.predictCoinAddress(eventData);
      if (ourPrediction.toLowerCase() !== eventData.coinAddress.toLowerCase()) {
        throw new Error(`Address mismatch: ETS predicted ${eventData.coinAddress}, we predicted ${ourPrediction}`);
      }

      // Check if coin already exists using the predicted address
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
      */

      // Generate metadata via metadata API
      const metadataResult = await this.generateMetadata(eventData);
      if (!metadataResult.success || !metadataResult.metadataUri) {
        throw new Error(`Metadata generation failed: ${metadataResult.error}`);
      }

      // Create coin using direct factory interaction
      const coinSalt = this.zoraFactory.generateCoinSalt(eventData.machineName);
      const poolConfig = this.zoraFactory.getStandardPoolConfig();

      const result = await this.zoraFactory.createCoin({
        payoutRecipient: eventData.creator as Address,
        owners: [eventData.creator as Address],
        uri: metadataResult.metadataUri,
        name: eventData.originalInput,
        symbol: "TAGS",
        poolConfig,
        platformReferrer: this.account.address, // TODO: Get from ETS contract configuration
        coinSalt,
      });

      if (!result.success) {
        throw new Error(result.error || "Factory coin creation failed");
      }

      // TODO: Re-enable address validation when integrating with ETS.computeCoinAddress()
      // For now, skip validation to test factory service functionality
      /*
      // Validate the returned address matches our prediction
      if (result.coinAddress?.toLowerCase() !== eventData.coinAddress.toLowerCase()) {
        throw new Error(
          `Factory returned unexpected address: expected ${eventData.coinAddress}, got ${result.coinAddress}`,
        );
      }
      */

      logger.info("Successfully created TAG coin via factory", {
        originalInput: eventData.originalInput,
        coinAddress: result.coinAddress,
        txHash: result.transactionHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed?.toString(),
        totalCostETH: result.totalCostETH ? `${result.totalCostETH} ETH` : undefined,
        totalCostWei: result.totalCostWei?.toString(),
      });

      return {
        success: true,
        coinAddress: result.coinAddress,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed,
        totalCostETH: result.totalCostETH,
      };
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
   * Check if a coin already exists for given event data
   */
  public async coinExists(eventData: TagCreatedEventData): Promise<boolean> {
    try {
      const coinAddress = eventData.coinAddress as Address;
      const bytecode = await this.publicClient.getBytecode({ address: coinAddress });
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
   * Generate metadata via metadata API
   */
  private async generateMetadata(eventData: TagCreatedEventData): Promise<{
    success: boolean;
    metadataUri?: string;
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
}

export default ZoraContractsService;

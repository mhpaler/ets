import * as ZoraProtocol from "@zoralabs/protocol-deployments";
import { type Address, type Hex, type PublicClient, type WalletClient, keccak256, parseEventLogs, toBytes } from "viem";
import { parseUnits, zeroAddress } from "viem";
import { base, baseSepolia } from "viem/chains";
import { logger } from "../../utils/logger";
// Using direct API calls since pool config functions aren't exported

// Zora factory address for Base chain (8453) - same across all chains due to deterministic deploys
export const COIN_FACTORY_ADDRESS = (ZoraProtocol as any).coinFactoryAddress["8453"] as Address;

export interface ZoraFactoryCreateParams {
  payoutRecipient: Address;
  owners: Address[];
  uri: string;
  name: string;
  symbol: string;
  poolConfig: Hex;
  platformReferrer: Address;
  coinSalt: Hex;
}

export interface ZoraFactoryResult {
  success: boolean;
  coinAddress?: Address;
  transactionHash?: Hex;
  blockNumber?: bigint;
  gasUsed?: bigint;
  effectiveGasPrice?: bigint;
  totalCostWei?: bigint;
  totalCostETH?: string;
  error?: string;
}

/**
 * Direct Zora factory service that bypasses the SDK for deterministic coin creation
 */
export class ZoraFactoryService {
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient;
  private readonly account: any;
  private readonly chainId: number;

  constructor(publicClient: PublicClient, walletClient: WalletClient, chainId: number) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
    this.account = walletClient.account;
    this.chainId = chainId;
  }

  /**
   * Generate deterministic coin salt from machine name (same as ETS contract)
   */
  generateCoinSalt(machineName: string): Hex {
    return keccak256(toBytes(machineName));
  }

  /**
   * Predict coin address using Zora factory (same parameters as ETS contract)
   */
  async predictCoinAddress(params: {
    msgSender: Address;
    name: string;
    symbol: string;
    poolConfig: Hex;
    platformReferrer: Address;
    coinSalt: Hex;
  }): Promise<Address> {
    try {
      const address = await this.publicClient.readContract({
        address: COIN_FACTORY_ADDRESS,
        abi: (ZoraProtocol as any).coinFactoryABI,
        functionName: "coinAddress",
        args: [
          params.msgSender,
          params.name,
          params.symbol,
          params.poolConfig,
          params.platformReferrer,
          params.coinSalt,
        ],
      });

      return address as Address;
    } catch (error) {
      logger.error("Failed to predict coin address", {
        error: error instanceof Error ? error.message : String(error),
        params,
      });
      throw error;
    }
  }

  /**
   * Create coin directly via Zora factory with deterministic parameters
   */
  async createCoin(params: ZoraFactoryCreateParams): Promise<ZoraFactoryResult> {
    try {
      logger.info("Creating coin via Zora factory", {
        name: params.name,
        symbol: params.symbol,
        payoutRecipient: params.payoutRecipient,
        coinSalt: params.coinSalt,
        account: this.account?.address,
      });

      // Simulate the transaction first
      const { request } = await this.publicClient.simulateContract({
        address: COIN_FACTORY_ADDRESS,
        abi: (ZoraProtocol as any).coinFactoryABI,
        functionName: "deploy",
        args: [
          params.payoutRecipient,
          params.owners,
          params.uri,
          params.name,
          params.symbol,
          params.poolConfig,
          params.platformReferrer,
          "0x0000000000000000000000000000000000000000" as Address, // postDeployHook
          "0x" as Hex, // postDeployHookData
          params.coinSalt,
        ],
        account: this.account,
      });

      // Execute the transaction
      // TODO: Remove @ts-ignore when viem fixes writeContract typing with dynamic ABIs
      // @ts-ignore - Complex viem generic typing issue with simulateContract -> writeContract flow
      const txHash = await this.walletClient.writeContract(request);

      // Wait for transaction receipt
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      // Parse the coin address from logs
      // TODO: Remove @ts-ignore when @zoralabs/protocol-deployments improves TypeScript definitions
      // @ts-ignore - parseEventLogs typing issue with dynamic ABI from protocol-deployments
      const logs = parseEventLogs({
        abi: (ZoraProtocol as any).coinFactoryABI,
        logs: receipt.logs,
      });

      // TODO: Remove @ts-ignore when event log typing is resolved
      // @ts-ignore - Event structure typing from parseEventLogs result
      const coinCreatedEvent = logs.find((log) => log.eventName === "CoinCreatedV4");
      // @ts-ignore - Event args property typing issue
      const coinAddress = coinCreatedEvent?.args?.coin as Address;

      if (!coinAddress) {
        throw new Error("Failed to extract coin address from transaction logs");
      }

      // Calculate transaction cost
      const gasUsed = receipt.gasUsed;
      const effectiveGasPrice = receipt.effectiveGasPrice || BigInt(0);
      const totalCostWei = gasUsed * effectiveGasPrice;
      const totalCostETH = (Number(totalCostWei) / 1e18).toFixed(6);

      logger.info("Successfully created coin via Zora factory", {
        coinAddress,
        txHash,
        blockNumber: receipt.blockNumber,
        gasUsed: gasUsed.toString(),
        effectiveGasPrice: effectiveGasPrice.toString(),
        totalCostETH: `${totalCostETH} ETH`,
      });

      return {
        success: true,
        coinAddress,
        transactionHash: txHash,
        blockNumber: receipt.blockNumber,
        gasUsed,
        effectiveGasPrice,
        totalCostWei,
        totalCostETH,
      };
    } catch (error) {
      logger.error("Failed to create coin via Zora factory", {
        error: error instanceof Error ? error.message : String(error),
        params,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get pool configuration for tradable coins
   * Uses Zora API with CREATOR_COIN_OR_ZORA currency and HIGH market cap
   * Falls back to manual CREATOR_COIN config if API fails
   */
  async getStandardPoolConfig(): Promise<Hex> {
    // Determine optimal currency based on chain
    const currency = this.chainId === 84532 ? "ETH" : "CREATOR_COIN"; // Base Sepolia only supports ETH

    try {
      logger.info("Fetching pool config from Zora API", {
        chainId: this.chainId,
        currency,
        startingMarketCap: "HIGH",
      });

      const apiUrl = "https://api-sdk.zora.engineering/create/content/pool-config";
      const params = new URLSearchParams({
        chain_id: this.chainId.toString(),
        currency,
        starting_market_cap: "HIGH",
      });

      const zoraApiKey = process.env.ZORA_API_KEY;
      const headers = {
        Accept: "application/json",
        "User-Agent": "ETS-Factory-Service/1.0",
        ...(zoraApiKey && zoraApiKey !== "your_zora_api_key_here" ? { "api-key": zoraApiKey } : {}),
      };

      const response = await fetch(`${apiUrl}?${params}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (!data.poolConfig) {
        throw new Error("No poolConfig in API response");
      }

      logger.info("✅ Using Zora API pool config", {
        currency,
        chainId: this.chainId,
        poolConfigLength: data.poolConfig.length,
        source: "ZORA_API",
      });

      return data.poolConfig as Hex;
    } catch (error) {
      logger.warn("⚠️ API failed, using manual fallback", {
        error: error instanceof Error ? error.message : String(error),
        chainId: this.chainId,
      });

      // Manual fallback with creator coin address
      const CREATOR_COIN_ADDRESS = "0x182e5583685615cc03bedcb575928eedf80e52de" as Address;

      const poolConfig = (ZoraProtocol as any).encodeMultiCurvePoolConfig({
        currency: CREATOR_COIN_ADDRESS,
        tickLower: [-250000],
        tickUpper: [-195000],
        numDiscoveryPositions: [11],
        maxDiscoverySupplyShare: [parseUnits("0.05", 18)],
      });

      logger.info("✅ Using manual CREATOR_COIN pool config", {
        currency: "CREATOR_COIN_MANUAL",
        creatorCoinAddress: CREATOR_COIN_ADDRESS,
        chainId: this.chainId,
        source: "MANUAL_FALLBACK",
      });

      return poolConfig as Hex;
    }
  }
}

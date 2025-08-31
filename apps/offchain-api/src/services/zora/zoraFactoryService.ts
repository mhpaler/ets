import * as ZoraProtocol from "@zoralabs/protocol-deployments";
import { type Address, type Hex, type PublicClient, type WalletClient, keccak256, parseEventLogs, toBytes } from "viem";
import { parseUnits, zeroAddress } from "viem";
import { base, baseSepolia } from "viem/chains";
import { logger } from "../../utils/logger";

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
   * Get standard pool configuration for the current chain
   * Uses ETH pairing configuration to match ETS contract standards
   */
  getStandardPoolConfig(): Hex {
    const COIN_ETH_PAIR_LOWER_TICK = -250000;
    const COIN_ETH_PAIR_UPPER_TICK = -195_000;
    const COIN_ETH_PAIR_NUM_DISCOVERY_POSITIONS = 11;
    const COIN_ETH_PAIR_MAX_DISCOVERY_SUPPLY_SHARE = parseUnits("0.05", 18);

    const poolConfig = (ZoraProtocol as any).encodeMultiCurvePoolConfig({
      currency: zeroAddress, // ETH pairing
      tickLower: [COIN_ETH_PAIR_LOWER_TICK],
      tickUpper: [COIN_ETH_PAIR_UPPER_TICK],
      numDiscoveryPositions: [COIN_ETH_PAIR_NUM_DISCOVERY_POSITIONS],
      maxDiscoverySupplyShare: [COIN_ETH_PAIR_MAX_DISCOVERY_SUPPLY_SHARE],
    });

    return poolConfig as Hex;
  }
}

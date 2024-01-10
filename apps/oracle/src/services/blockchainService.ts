/**
 * BlockchainService is a class responsible for interacting with the blockchain.
 * It provides methods to fetch blockchain data and watch for specific events.
 */

// Import necessary modules and configurations.
import { AbiEvent } from "abitype";
import { createPublicClient, http, createWalletClient, PublicClient, WalletClient, PrivateKeyAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat, polygonMumbai } from "viem/chains";
import { etsAuctionHouseConfig, etsAccessControlsConfig } from "../contracts.ts";
import { TagService } from "./tagService.ts";

// Define the BlockchainService class.
export class BlockchainService {
  // Ensure that there's only one instance of BlockchainService.
  private static instance: BlockchainService;
  public publicClient: PublicClient;
  public walletClient: WalletClient;
  private etsOracleAccount: PrivateKeyAccount;

  /**
   * Create a new instance of BlockchainService.
   * Initialize the necessary clients and account.
   */
  constructor() {
    // Determine the chain based on the NETWORK environment variable
    let chain;
    if (process.env.NETWORK === "localhost") {
      chain = hardhat;
    } else if (process.env.NETWORK === "mumbai" || process.env.NETWORK === "mumbai_stage") {
      chain = polygonMumbai;
    }

    console.log("Chain: ", chain?.name);

    this.publicClient = createPublicClient({
      chain: chain,
      transport: http(),
    });

    this.walletClient = createWalletClient({
      chain: chain,
      transport: http(),
    });

    // Load ETSOracle account from mnemonic. Make sure key corresponds to correct chain.
    this.etsOracleAccount = privateKeyToAccount(`0x${process.env.ETS_ORACLE_PK}`);
  }

  /**
   * Get an instance of BlockchainService (singleton pattern).
   * @returns An instance of BlockchainService.
   */
  public static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  /**
   * Fetch the ETS Platform address from the blockchain.
   * @returns A Promise that resolves to the ETS Platform address.
   */
  public async getPlatformAddress(): Promise<string> {
    const platformAddress: string = await this.publicClient.readContract({
      ...etsAccessControlsConfig,
      functionName: "getPlatformAddress",
    });
    return platformAddress.toLowerCase();
  }

  /**
   * Fetch the HDAccount representing the platform's account.
   * @returns A Promise that resolves to the platform's HDAccount.
   */
  public async getOracleAccount(): Promise<PrivateKeyAccount> {
    // TODO: check isAuctionOracle.
    return this.etsOracleAccount;
  }

  /**
   * Fetch the ID of the last auction from the blockchain.
   * @returns A Promise that resolves to the ID of the last auction.
   */
  public async getLastAuctionId(): Promise<bigint> {
    const lastAuctionId = await this.publicClient.readContract({
      ...etsAuctionHouseConfig,
      functionName: "getTotalCount",
    });
    return lastAuctionId;
  }

  /**
   * Fetch the ID of the token auctioned in a specific auction.
   * @param auctionId - The ID of the auction.
   * @returns A Promise that resolves to the token ID.
   */
  public async getAuctionedTokenId(auctionId: bigint): Promise<bigint> {
    const auction = await this.publicClient.readContract({
      ...etsAuctionHouseConfig,
      functionName: "getAuction",
      args: [auctionId],
    });
    return auction.tokenId;
  }

  /**
   * Start watching for the "RequestCreateAuction" event on the blockchain.
   */
  public async watchRequestCreateAuction() {
    const requestCreateAuction = etsAuctionHouseConfig.abi.find(
      (item) => item.type === "event" && item.name === "RequestCreateAuction",
    ) as AbiEvent;

    if (!requestCreateAuction) {
      console.error("RequestCreateAuction event not found in ABI");
      process.exit(1);
    }

    console.log("Watching for RequestCreateAuction event...");
    console.log("Event ABI:", requestCreateAuction);
    console.log("Watching Contract: ", etsAuctionHouseConfig.address);

    const unwatchRequestCreateAuction = this.publicClient.watchEvent({
      address: etsAuctionHouseConfig.address,
      event: requestCreateAuction,
      onLogs: async () => {
        // TODO: review logs to verify block, address & transactionHash of event?
        //console.log(logs);
        try {
          // Find the oldest CTAG owned by ETS
          const account: PrivateKeyAccount = await this.getOracleAccount();
          const platformAccount = (await this.getPlatformAddress()).toLowerCase();
          const lastAuctionId = await this.getLastAuctionId();
          const lastAuctionTokenId = (await this.getAuctionedTokenId(lastAuctionId)).toString();
          const tagService = new TagService();
          const tokenId = await tagService.findNextCTAG(platformAccount, lastAuctionTokenId);

          const { request } = await this.publicClient.simulateContract({
            account,
            ...etsAuctionHouseConfig,
            functionName: "fulfillRequestCreateAuction",
            args: [BigInt(tokenId)],
          });

          const response = await this.walletClient.writeContract(request);
          console.log(`Next token successfully released. Txn Hash: ${response}`);
        } catch (error: any) {
          console.error("An unexpected error occurred: ", error.message);
        }
      },
      onError: (error) => {
        console.error("Error:", error);
      },
    });

    // Handle graceful shutdown (e.g., with Ctrl+C)
    process.on("SIGINT", () => {
      unwatchRequestCreateAuction();
      console.log("requestCreateAuction Service terminated.");
      process.exit();
    });
  }
}

// Create a singleton instance of BlockchainService.
const blockchainService = BlockchainService.getInstance();
export default blockchainService;

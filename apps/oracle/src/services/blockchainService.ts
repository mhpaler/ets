/**
 * BlockchainService is a class responsible for interacting with the blockchain.
 * It provides methods to fetch blockchain data and watch for specific events.
 */
import { ethers } from "ethers";
import { DefenderRelaySigner } from "@openzeppelin/defender-sdk-relay-signer-client/lib/ethers/signer";

//import { DefenderRelaySigner } from "@openzeppelin/defender-relay-client/lib/ethers";
import { etsAuctionHouseConfig, etsAccessControlsConfig } from "../contracts";
import { TagService } from "./tagService";

// Assuming ABI and addresses are correctly defined in your contracts configurations
const { abi: accessControlsAbi, address: accessControlsAddress } = etsAccessControlsConfig;
const { abi: auctionHouseAbi, address: auctionHouseAddress } = etsAuctionHouseConfig;

export class BlockchainService {
  //private provider: ethers.providers.Provider;
  //private static instance: BlockchainService | null = null;
  private signer: ethers.Signer | DefenderRelaySigner;
  private accessControlsContract: ethers.Contract;
  private auctionHouseContract: ethers.Contract;

  constructor(signer: ethers.Signer | DefenderRelaySigner) {
    this.signer = signer as ethers.Signer;
    this.accessControlsContract = new ethers.Contract(accessControlsAddress, accessControlsAbi, this.signer);
    this.auctionHouseContract = new ethers.Contract(auctionHouseAddress, auctionHouseAbi, this.signer);
  }

  public async getPlatformAddress(): Promise<string> {
    const platformAddress = await this.accessControlsContract.getPlatformAddress();
    return platformAddress.toLowerCase();
  }

  public async getLastAuctionId(): Promise<bigint> {
    const lastAuctionId = await this.auctionHouseContract.getTotalCount();
    return lastAuctionId;
  }

  public async getAuctionedTokenId(auctionId: bigint): Promise<bigint> {
    const auction = await this.auctionHouseContract.getAuction(auctionId);
    return auction.tokenId;
  }

  public async handleRequestCreateAuctionEvent() {
    try {
      const platformAccount = (await this.getPlatformAddress()).toLowerCase();
      const lastAuctionId = await this.getLastAuctionId();
      const lastAuctionTokenId = (await this.getAuctionedTokenId(lastAuctionId)).toString();
      const tagService = new TagService(); // Ensure TagService is correctly initialized
      const tokenId = await tagService.findNextCTAG(platformAccount, lastAuctionTokenId);

      const tx = await this.auctionHouseContract.fulfillRequestCreateAuction(BigInt(tokenId));
      const receipt = await tx.wait();

      console.log(`Next token successfully released. Txn Hash: ${receipt.transactionHash}`);
    } catch (error) {
      console.error("An unexpected error occurred: ", error);
    }
  }

  public async watchRequestCreateAuction() {
    // Subscribing to the RequestCreateAuction event.
    console.log("***** Local auction oracle started *****");
    console.log("Listening for RequestCreateAuction event...");

    this.auctionHouseContract.on("RequestCreateAuction", async (...args) => {
      console.log("RequestCreateAuction event detected:", args);
      await this.handleRequestCreateAuctionEvent();
    });

    const stopListening = () => {
      this.auctionHouseContract.removeAllListeners("RequestCreateAuction");
      console.log("Stopped listening to RequestCreateAuction events.");
    };

    // Handling SIGINT signal to gracefully shut down and cleanup.
    process.on("SIGINT", () => {
      stopListening();
      console.log("Cleanup complete. Exiting now.");
      process.exit();
    });
  }
}

import type { Log } from "viem";
import { apiClient } from "../clients/apiClient";
import { viemClient } from "../clients/viemClient";
import { config } from "../config";
import type { TagCreatedEvent, ZoraCoinCreationRequest } from "../types";
import { getComponentLogger } from "../utils/logger";

/**
 * Processes TagCreated events and initiates Zora coin creation
 */
export class TagCoinHandler {
  private readonly logger = getComponentLogger("TagCoinHandler");

  /**
   * Handle a batch of TagCreated event logs
   */
  async handleTagCreatedLogs(logs: Log[]): Promise<void> {
    this.logger.info({ eventCount: logs.length }, "Processing TagCreated event(s)");

    for (const log of logs) {
      try {
        await this.processSingleTagCreatedEvent(log);
      } catch (error) {
        this.logger.error(
          {
            transactionHash: log.transactionHash,
            error: error instanceof Error ? error.message : error,
          },
          "Failed to process TagCreated event",
        );
        // Continue processing other events even if one fails
      }
    }
  }

  /**
   * Process a single TagCreated event
   */
  private async processSingleTagCreatedEvent(log: Log): Promise<void> {
    // Parse the event data
    const tagEvent = this.parseTagCreatedEvent(log);

    this.logger.info(
      {
        coinAddress: tagEvent.coinAddress,
        machineName: tagEvent.machineName,
        creator: tagEvent.creator,
        transactionHash: tagEvent.transactionHash,
      },
      "Processing TagCreated event",
    );

    // Create request for off-chain API
    const request: ZoraCoinCreationRequest = {
      tagData: tagEvent,
      chainId: config.chainId,
    };

    // Call off-chain API to create Zora coin
    const response = await apiClient.createZoraCoin(request);

    if (response.success && response.zoraCoinAddress) {
      this.logger.info(
        {
          etsCoinAddress: tagEvent.coinAddress,
          zoraCoinAddress: response.zoraCoinAddress,
          transactionHash: response.transactionHash,
        },
        "Successfully created Zora coin",
      );

      // Complete the round-trip: Update the ETS contract with actual Zora coin address
      try {
        await this.updateETSContractWithZoraCoinAddress(tagEvent.coinAddress, response.zoraCoinAddress);
        this.logger.info("Successfully updated ETS contract with Zora coin address");
      } catch (updateError) {
        this.logger.error(
          {
            etsCoinAddress: tagEvent.coinAddress,
            zoraCoinAddress: response.zoraCoinAddress,
            error: updateError instanceof Error ? updateError.message : updateError,
          },
          "Failed to update ETS contract",
        );
        // Don't throw here - the Zora coin was created successfully
      }
    } else {
      this.logger.error(
        {
          etsCoinAddress: tagEvent.coinAddress,
          error: response.error,
        },
        "Failed to create Zora coin",
      );
    }
  }

  /**
   * Update ETS contract with actual Zora coin address (complete the round-trip)
   */
  private async updateETSContractWithZoraCoinAddress(
    predictedCoinAddress: string,
    actualCoinAddress: string,
  ): Promise<void> {
    if (!viemClient.writeContract) {
      throw new Error("Private key not configured - cannot perform blockchain write operations");
    }

    // Call the updateTagZoraCoinAddress function on the ETS Token contract
    const hash = await viemClient.writeContract({
      address: config.etsTokenAddress as `0x${string}`,
      abi: [
        {
          name: "updateTagZoraCoinAddress",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "_predictedCoinAddress", type: "address" },
            { name: "_actualCoinAddress", type: "address" },
          ],
          outputs: [],
        },
      ],
      functionName: "updateTagZoraCoinAddress",
      args: [predictedCoinAddress as `0x${string}`, actualCoinAddress as `0x${string}`],
      chain: null, // Let the client determine the chain
    });

    this.logger.info({ transactionHash: hash }, "ETS contract update transaction submitted");

    // Wait for transaction confirmation
    const receipt = await viemClient.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
      this.logger.info(
        {
          transactionHash: hash,
          blockNumber: receipt.blockNumber,
        },
        "ETS contract update confirmed",
      );
    } else {
      throw new Error(`Transaction failed with status: ${receipt.status}`);
    }
  }

  /**
   * Parse TagCreated event log into structured data
   */
  private parseTagCreatedEvent(log: Log): TagCreatedEvent {
    // TODO: Implement proper event parsing using decodeEventLog
    // For now, return a placeholder structure
    const args = {} as any;

    return {
      coinAddress: args.coinAddress,
      originalInput: args.originalInput,
      displayVersion: args.displayVersion,
      machineName: args.machineName,
      creator: args.creator,
      relayer: args.relayer,
      timestamp: args.timestamp,
      blockNumber: log.blockNumber || 0n,
      transactionHash: log.transactionHash || "",
    };
  }
}

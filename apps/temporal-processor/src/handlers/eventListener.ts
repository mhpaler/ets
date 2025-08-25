import { Client } from "@temporalio/client";
import { http, type Log, createPublicClient, decodeEventLog, parseAbi, parseAbiItem } from "viem";
import { base, localhost, sepolia } from "viem/chains";
import { config } from "../config";
import type { TagCreatedEvent, TargetCreatedEvent } from "../types";
import { getComponentLogger } from "../utils/logger";

const logger = getComponentLogger("EventListener");

// Get chain configuration based on chainId
function getChain() {
  switch (config.blockchain.chainId) {
    case 31337:
      return localhost;
    case 11155111:
      return sepolia;
    case 8453:
      return base;
    default:
      return localhost;
  }
}

// Create viem public client
const publicClient = createPublicClient({
  chain: getChain(),
  transport: http(config.blockchain.rpcUrl),
});

// Event ABIs - using simplified signature that matches working event processor
// Note: targetId is NOT indexed in the actual contract
const targetCreatedAbi = parseAbiItem("event TargetCreated(uint256 targetId)");

const tagCreatedAbi = parseAbiItem(
  "event TagCreated(address indexed coinAddress, string originalInput, string displayVersion, string machineName, address indexed creator, address indexed relayer, uint256 timestamp)",
);

// ETSTarget contract ABI for reading target data (unused but kept for future workflow use)
const _etsTargetAbi = parseAbi([
  "function getTargetById(uint256 _targetId) view returns (string targetURI, address createdBy, uint256 enriched, uint256 httpStatus, string arweaveTxId)",
]);

export class EventListener {
  private temporalClient: Client | null = null;
  private unwatchTargetCreated?: () => void;
  private unwatchTagCreated?: () => void;
  private isRunning = false;

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn("Event listener is already running");
      return;
    }

    logger.info("🚀 Starting blockchain event listener...");
    this.isRunning = true;

    try {
      // Initialize Temporal client
      this.temporalClient = new Client({
        connection: {
          address: config.temporal.serverUrl,
        },
        namespace: config.temporal.namespace,
      });

      logger.info(
        {
          temporalServer: config.temporal.serverUrl,
          namespace: config.temporal.namespace,
          taskQueue: config.temporal.taskQueue,
        },
        "Connected to Temporal server",
      );

      // Start watching for TargetCreated events
      this.watchTargetCreatedEvents();

      // Start watching for TagCreated events
      this.watchTagCreatedEvents();

      logger.info(
        {
          chainId: config.blockchain.chainId,
          rpcUrl: config.blockchain.rpcUrl,
          contracts: {
            etsTarget: config.blockchain.contracts.etsTarget,
            etsToken: config.blockchain.contracts.etsToken,
          },
        },
        "👀 Event listeners started successfully",
      );
    } catch (error) {
      logger.error({ error }, "Failed to start event listener");
      throw error;
    }
  }

  private watchTargetCreatedEvents(): void {
    logger.info("Setting up TargetCreated event watcher...");

    logger.info("🔧 Initializing watchContractEvent for TargetCreated...");
    this.unwatchTargetCreated = publicClient.watchContractEvent({
      address: config.blockchain.contracts.etsTarget as `0x${string}`,
      abi: [targetCreatedAbi],
      eventName: "TargetCreated",
      onLogs: async (logs) => {
        logger.info(`🎯 DETECTED ${logs.length} TargetCreated event(s)`);
        for (const log of logs) {
          await this.handleTargetCreatedEvent(log);
        }
      },
      onError: (error) => {
        logger.error({ error }, "❌ Error watching TargetCreated events");
      },
      pollingInterval: 2000, // Poll every 2 seconds
    });
    logger.info("✅ TargetCreated watcher initialized");

    logger.info({ contract: config.blockchain.contracts.etsTarget }, "Watching for TargetCreated events");

    // Add periodic debug polling to verify the watcher is working
    setInterval(async () => {
      try {
        const latestBlock = await publicClient.getBlockNumber();
        logger.info(
          `🔄 Polling debug: Latest block ${latestBlock}, watching contract ${config.blockchain.contracts.etsTarget}`,
        );

        // Also check for recent events using getLogs as a verification
        const recentLogs = await publicClient.getLogs({
          address: config.blockchain.contracts.etsTarget as `0x${string}`,
          event: targetCreatedAbi,
          fromBlock: latestBlock - 10n >= 0n ? latestBlock - 10n : 0n,
          toBlock: latestBlock,
        });

        if (recentLogs.length > 0) {
          logger.info(`📋 getLogs found ${recentLogs.length} TargetCreated event(s) in recent blocks`);
        }
      } catch (error) {
        logger.error({ error }, "❌ Debug polling failed");
      }
    }, 10000); // Every 10 seconds
  }

  private watchTagCreatedEvents(): void {
    logger.info("Setting up TagCreated event watcher...");

    logger.info("🔧 Initializing watchContractEvent for TagCreated...");
    this.unwatchTagCreated = publicClient.watchContractEvent({
      address: config.blockchain.contracts.etsToken as `0x${string}`,
      abi: [tagCreatedAbi],
      eventName: "TagCreated",
      onLogs: async (logs) => {
        logger.info(`🏷️ DETECTED ${logs.length} TagCreated event(s)`);
        for (const log of logs) {
          await this.handleTagCreatedEvent(log);
        }
      },
      onError: (error) => {
        logger.error({ error }, "❌ Error watching TagCreated events");
      },
      pollingInterval: 2000, // Poll every 2 seconds
    });
    logger.info("✅ TagCreated watcher initialized");

    logger.info({ contract: config.blockchain.contracts.etsToken }, "Watching for TagCreated events");
  }

  private async handleTargetCreatedEvent(log: Log): Promise<void> {
    try {
      const { transactionHash, blockNumber } = log;
      const decoded = decodeEventLog({
        abi: [targetCreatedAbi],
        data: log.data,
        topics: log.topics,
      });
      const { targetId } = decoded.args;

      logger.info(
        {
          targetId: targetId.toString(),
          transactionHash,
          blockNumber: blockNumber?.toString(),
        },
        "🎯 TargetCreated event detected",
      );

      if (!this.temporalClient) {
        throw new Error("Temporal client not initialized");
      }

      // Get block timestamp
      logger.info("Fetching block timestamp...");
      const block = await publicClient.getBlock({ blockNumber: blockNumber! });

      logger.info("Preparing workflow arguments...");
      const workflowArgs = {
        targetId: targetId.toString(),
        transactionHash,
        blockNumber: blockNumber!.toString(),
        chainId: config.blockchain.chainId,
        timestamp: new Date(Number(block.timestamp) * 1000),
      };

      // Start Temporal workflow for target enrichment
      logger.info("Starting Temporal workflow...");
      const workflowId = `target-enrichment-${targetId}-${Date.now()}`;
      await this.temporalClient.workflow.start("TargetEnrichmentWorkflow", {
        workflowId,
        taskQueue: config.temporal.taskQueue,
        args: [workflowArgs],
      });

      logger.info("Workflow started successfully!");

      logger.info(
        {
          workflowId,
          targetId: targetId.toString(),
        },
        "Started TargetEnrichmentWorkflow",
      );
    } catch (error) {
      logger.error(
        {
          error:
            error instanceof Error
              ? {
                  name: error.name,
                  message: error.message,
                  stack: error.stack,
                  cause: error.cause,
                }
              : error,
          errorString: String(error),
          log,
        },
        "Failed to handle TargetCreated event",
      );
    }
  }

  private async handleTagCreatedEvent(log: Log): Promise<void> {
    try {
      const { transactionHash, blockNumber } = log;
      const decoded = decodeEventLog({
        abi: [tagCreatedAbi],
        data: log.data,
        topics: log.topics,
      });
      const { coinAddress, originalInput, displayVersion, machineName, creator, relayer } = decoded.args;

      logger.info(
        {
          coinAddress,
          originalInput,
          displayVersion,
          machineName,
          creator,
          relayer,
          transactionHash,
          blockNumber: blockNumber?.toString(),
        },
        "🏷️ TagCreated event detected",
      );

      if (!this.temporalClient) {
        throw new Error("Temporal client not initialized");
      }

      // Get block timestamp
      const block = await publicClient.getBlock({ blockNumber: blockNumber! });

      // Start Temporal workflow for TAG coin creation
      const workflowId = `tag-coin-creation-${coinAddress}-${Date.now()}`;
      await this.temporalClient.workflow.start("TagCreatedWorkflow", {
        workflowId,
        taskQueue: config.temporal.taskQueue,
        args: [
          {
            coinAddress,
            originalInput,
            displayVersion,
            machineName,
            creator,
            relayer,
            transactionHash,
            blockNumber: blockNumber!,
            chainId: config.blockchain.chainId,
            timestamp: new Date(Number(block.timestamp) * 1000),
          },
        ],
      });

      logger.info(
        {
          workflowId,
          coinAddress,
          originalInput,
          displayVersion,
        },
        "Started TagCreatedWorkflow",
      );
    } catch (error) {
      logger.error(
        {
          error,
          log,
        },
        "Failed to handle TagCreated event",
      );
    }
  }

  async stop(): Promise<void> {
    logger.info("Stopping event listener...");

    if (this.unwatchTargetCreated) {
      this.unwatchTargetCreated();
    }

    if (this.unwatchTagCreated) {
      this.unwatchTagCreated();
    }

    if (this.temporalClient) {
      await this.temporalClient.connection.close();
    }

    this.isRunning = false;
    logger.info("Event listener stopped");
  }
}

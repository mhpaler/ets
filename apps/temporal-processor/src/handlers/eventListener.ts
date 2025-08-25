import { Client } from "@temporalio/client";
import { http, type Log, createPublicClient, parseAbiItem } from "viem";
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

// Event ABIs
const targetCreatedAbi = parseAbiItem(
  "event TargetCreated(uint256 indexed targetId, string targetURI, uint256 targetType, address indexed creator)",
);

const tagCreatedAbi = parseAbiItem(
  "event TagCreated(uint256 indexed tagId, address indexed coinAddress, string tagString, address indexed creator, uint256 blockNumber, address relayer, uint256 timestamp)",
);

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

    this.unwatchTargetCreated = publicClient.watchEvent({
      address: config.blockchain.contracts.etsTarget,
      event: targetCreatedAbi,
      onLogs: async (logs: Log[]) => {
        for (const log of logs) {
          await this.handleTargetCreatedEvent(log);
        }
      },
      onError: (error) => {
        logger.error({ error }, "Error watching TargetCreated events");
      },
    });

    logger.info({ contract: config.blockchain.contracts.etsTarget }, "Watching for TargetCreated events");
  }

  private watchTagCreatedEvents(): void {
    logger.info("Setting up TagCreated event watcher...");

    this.unwatchTagCreated = publicClient.watchEvent({
      address: config.blockchain.contracts.etsToken,
      event: tagCreatedAbi,
      onLogs: async (logs: Log[]) => {
        for (const log of logs) {
          await this.handleTagCreatedEvent(log);
        }
      },
      onError: (error) => {
        logger.error({ error }, "Error watching TagCreated events");
      },
    });

    logger.info({ contract: config.blockchain.contracts.etsToken }, "Watching for TagCreated events");
  }

  private async handleTargetCreatedEvent(log: Log): Promise<void> {
    try {
      const { args, transactionHash, blockNumber } = log;
      const [targetId, targetURI, targetType, creator] = args as [bigint, string, bigint, `0x${string}`];

      logger.info(
        {
          targetId: targetId.toString(),
          targetURI,
          targetType: targetType.toString(),
          creator,
          transactionHash,
          blockNumber: blockNumber?.toString(),
        },
        "🎯 TargetCreated event detected",
      );

      if (!this.temporalClient) {
        throw new Error("Temporal client not initialized");
      }

      // Get block timestamp
      const block = await publicClient.getBlock({ blockNumber: blockNumber! });

      // Start Temporal workflow for target enrichment
      const workflowId = `target-enrichment-${targetId}-${Date.now()}`;
      const _handle = await this.temporalClient.workflow.start("TargetEnrichmentWorkflow", {
        workflowId,
        taskQueue: config.temporal.taskQueue,
        args: [
          {
            targetId: targetId.toString(),
            targetURI,
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
          targetId: targetId.toString(),
        },
        "Started TargetEnrichmentWorkflow",
      );
    } catch (error) {
      logger.error(
        {
          error,
          log,
        },
        "Failed to handle TargetCreated event",
      );
    }
  }

  private async handleTagCreatedEvent(log: Log): Promise<void> {
    try {
      const { args, transactionHash, blockNumber } = log;
      const [tagId, coinAddress, tagString, creator] = args as [bigint, `0x${string}`, string, `0x${string}`];

      logger.info(
        {
          tagId: tagId.toString(),
          coinAddress,
          tagString,
          creator,
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
      const workflowId = `tag-coin-creation-${tagId}-${Date.now()}`;
      const _handle = await this.temporalClient.workflow.start("TagCreatedWorkflow", {
        workflowId,
        taskQueue: config.temporal.taskQueue,
        args: [
          {
            tagId: tagId.toString(),
            coinAddress,
            tagString,
            creator,
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
          tagId: tagId.toString(),
          tagString,
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

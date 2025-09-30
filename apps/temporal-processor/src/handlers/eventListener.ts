import { Client } from "@temporalio/client";
import { http, type Abi, type AbiEvent, type Log, createPublicClient, decodeEventLog } from "viem";
import { base, localhost, sepolia } from "viem/chains";
import { config } from "../config";
import type { TagCreatedEvent, TargetCreatedEvent } from "../types";
import { CheckpointManager } from "../utils/checkpoint";
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
// TODO: For production, consider:
// 1. Use webSocket transport if RPC supports it (more efficient than polling)
// 2. Implement watchBlockNumber + getLogs pattern for missed events recovery
// 3. Add exponential backoff for reconnection on failures
const publicClient = createPublicClient({
  chain: getChain(),
  transport: http(config.blockchain.rpcUrl),
  // Enable batch processing for better performance
  batch: {
    multicall: true,
  },
});

// Store ABIs and events (will be loaded asynchronously)
let ETSTargetABI: Abi;
let ETSTokenABI: Abi;
let targetCreatedEvent: AbiEvent;
let enrichTargetRequestedEvent: AbiEvent;
let tagCreatedEvent: AbiEvent;

// Load ABIs asynchronously
async function loadABIs() {
  const abis = await import("@ethereum-tag-service/contracts/abis");
  ETSTargetABI = abis.ETSTargetABI as Abi;
  ETSTokenABI = abis.ETSTokenABI as Abi;

  targetCreatedEvent = ETSTargetABI.find((item) => item.type === "event" && item.name === "TargetCreated") as AbiEvent;
  enrichTargetRequestedEvent = ETSTargetABI.find(
    (item) => item.type === "event" && item.name === "EnrichTargetRequested",
  ) as AbiEvent;
  tagCreatedEvent = ETSTokenABI.find((item) => item.type === "event" && item.name === "TagCreated") as AbiEvent;
}

export class EventListener {
  private temporalClient: Client | null = null;
  private unwatchTargetCreated?: () => void;
  private unwatchEnrichTargetRequested?: () => void;
  private unwatchTagCreated?: () => void;
  private processedEvents = new Set<string>(); // Track processed events to avoid duplicates
  private debugPollingInterval?: NodeJS.Timeout;
  private checkpointManager: CheckpointManager;
  private isRunning = false;

  constructor() {
    this.checkpointManager = new CheckpointManager(config.env);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn("Event listener is already running");
      return;
    }

    logger.info("🚀 Starting blockchain event listener...");
    this.isRunning = true;

    try {
      // Load contract ABIs first
      await loadABIs();
      logger.info("Contract ABIs loaded successfully");

      // Initialize checkpoint manager
      await this.checkpointManager.initialize();

      // Check for chain reset
      const currentBlock = await publicClient.getBlockNumber();
      const currentChainId = config.blockchain.chainId;
      const currentContracts = {
        etsTarget: config.blockchain.contracts.etsTarget,
        etsToken: config.blockchain.contracts.etsToken,
      };

      const wasReset = await this.checkpointManager.detectChainReset(currentBlock, currentChainId, currentContracts);

      if (wasReset) {
        logger.info("🔄 Starting fresh after chain reset");
        this.processedEvents.clear();
      } else {
        // Load last processed block if available
        const lastBlock = this.checkpointManager.getLastProcessedBlock();
        if (lastBlock) {
          logger.info(`📍 Resuming from checkpoint at block ${lastBlock}`);
        }
      }

      // Initialize Temporal client
      this.temporalClient = new Client({
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

      // Start watching for EnrichTargetRequested events
      this.watchEnrichTargetRequestedEvents();

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

  private watchEnrichTargetRequestedEvents(): void {
    logger.info("Setting up EnrichTargetRequested event watcher...");

    if (!enrichTargetRequestedEvent) {
      logger.error("enrichTargetRequestedEvent not loaded yet!");
      return;
    }

    this.unwatchEnrichTargetRequested = publicClient.watchContractEvent({
      address: config.blockchain.contracts.etsTarget as `0x${string}`,
      abi: [enrichTargetRequestedEvent],
      eventName: "EnrichTargetRequested",
      onLogs: async (logs) => {
        logger.info(`🔄 DETECTED ${logs.length} EnrichTargetRequested event(s)`);
        for (const log of logs) {
          await this.handleEnrichTargetRequestedEvent(log);
        }
      },
      onError: (error) => {
        logger.error({ error }, "❌ Error watching EnrichTargetRequested events");
      },
      pollingInterval: 1000, // Poll every second for better responsiveness
    });
    logger.info("✅ EnrichTargetRequested watcher initialized");
  }

  private watchTargetCreatedEvents(): void {
    logger.info("Setting up TargetCreated event watcher...");

    if (!targetCreatedEvent) {
      logger.error("targetCreatedEvent not loaded yet!");
      return;
    }

    logger.info("🔧 Initializing watchContractEvent for TargetCreated...");
    this.unwatchTargetCreated = publicClient.watchContractEvent({
      address: config.blockchain.contracts.etsTarget as `0x${string}`,
      abi: [targetCreatedEvent],
      eventName: "TargetCreated",
      onLogs: async (logs) => {
        logger.info(`🎯 DETECTED ${logs.length} TargetCreated event(s)`);
        const newEventIds: string[] = [];
        let highestBlock = 0n;

        for (const log of logs as Log[]) {
          const eventKey = `${log.transactionHash}-${log.logIndex}`;
          // Add to processedEvents IMMEDIATELY to prevent race condition
          if (!this.processedEvents.has(eventKey) && !this.checkpointManager.hasProcessedEvent(eventKey)) {
            // Mark as processed BEFORE handling to prevent double processing
            this.processedEvents.add(eventKey);
            newEventIds.push(eventKey);

            // Now handle the event
            await this.handleTargetCreatedEvent(log);

            if (log.blockNumber && log.blockNumber > highestBlock) {
              highestBlock = log.blockNumber;
            }
          } else {
            logger.debug(`Skipping duplicate event ${eventKey}`);
          }
        }

        // Update checkpoint if we processed any new events
        if (newEventIds.length > 0 && highestBlock > 0n) {
          await this.checkpointManager.updateProcessedEvents(
            highestBlock,
            config.blockchain.chainId,
            {
              etsTarget: config.blockchain.contracts.etsTarget,
              etsToken: config.blockchain.contracts.etsToken,
            },
            newEventIds,
          );
        }
      },
      onError: (error) => {
        logger.error({ error }, "❌ Error watching TargetCreated events");
      },
      pollingInterval: 1000, // Poll every second for better responsiveness
    });
    logger.info("✅ TargetCreated watcher initialized");

    logger.info({ contract: config.blockchain.contracts.etsTarget }, "Watching for TargetCreated events");

    // Add periodic debug polling to verify the watcher is working
    this.debugPollingInterval = setInterval(async () => {
      try {
        const latestBlock = await publicClient.getBlockNumber();
        logger.info(
          `🔄 Polling debug: Latest block ${latestBlock}, watching contract ${config.blockchain.contracts.etsTarget}`,
        );

        // Determine the starting block for getLogs
        const lastProcessedBlock = this.checkpointManager.getLastProcessedBlock();
        const fromBlock = lastProcessedBlock
          ? lastProcessedBlock + 1n > latestBlock
            ? latestBlock
            : lastProcessedBlock + 1n
          : latestBlock - 10n >= 0n
            ? latestBlock - 10n
            : 0n;

        // Only look for new events since last checkpoint (skip if ABI not loaded)
        if (!targetCreatedEvent) {
          logger.warn("targetCreatedEvent not loaded yet, skipping getLogs");
          return;
        }

        const recentLogs = await publicClient.getLogs({
          address: config.blockchain.contracts.etsTarget as `0x${string}`,
          event: targetCreatedEvent,
          fromBlock,
          toBlock: latestBlock,
        });

        if (recentLogs.length > 0) {
          logger.info(
            `📋 getLogs found ${recentLogs.length} TargetCreated event(s) in blocks ${fromBlock}-${latestBlock}`,
          );
          // Process these events since watchContractEvent might have missed them
          let processedCount = 0;
          const newEventIds: string[] = [];

          for (const log of recentLogs) {
            const eventKey = `${log.transactionHash}-${log.logIndex}`;
            if (!this.processedEvents.has(eventKey) && !this.checkpointManager.hasProcessedEvent(eventKey)) {
              // Mark as processed BEFORE handling to prevent double processing
              this.processedEvents.add(eventKey);
              newEventIds.push(eventKey);

              logger.info(`🔄 Processing unhandled event from block ${log.blockNumber}`);
              await this.handleTargetCreatedEvent(log as Log);
              processedCount++;
            }
          }

          if (processedCount > 0) {
            logger.info(`✅ Processed ${processedCount} previously unhandled event(s)`);

            // Update checkpoint with new state
            await this.checkpointManager.updateProcessedEvents(
              latestBlock,
              config.blockchain.chainId,
              {
                etsTarget: config.blockchain.contracts.etsTarget,
                etsToken: config.blockchain.contracts.etsToken,
              },
              newEventIds,
            );
          }
        }
      } catch (error) {
        logger.error({ error }, "❌ Debug polling failed");
      }
    }, 10000); // Every 10 seconds
  }

  private watchTagCreatedEvents(): void {
    logger.info("Setting up TagCreated event watcher...");

    if (!tagCreatedEvent) {
      logger.error("tagCreatedEvent not loaded yet!");
      return;
    }

    logger.info("🔧 Initializing watchContractEvent for TagCreated...");
    this.unwatchTagCreated = publicClient.watchContractEvent({
      address: config.blockchain.contracts.etsToken as `0x${string}`,
      abi: [tagCreatedEvent],
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
      pollingInterval: 1000, // Poll every second for better responsiveness
    });
    logger.info("✅ TagCreated watcher initialized");

    logger.info({ contract: config.blockchain.contracts.etsToken }, "Watching for TagCreated events");
  }

  private async handleEnrichTargetRequestedEvent(log: Log): Promise<void> {
    try {
      const { transactionHash, blockNumber } = log;
      const decoded = decodeEventLog({
        abi: [enrichTargetRequestedEvent],
        data: log.data,
        topics: log.topics,
      });
      const { targetId, requestor } = (decoded.args || {}) as { targetId: bigint; requestor: string };

      logger.info(
        {
          targetId: targetId.toString(),
          requestor,
          transactionHash,
          blockNumber: blockNumber?.toString(),
        },
        "🔄 EnrichTargetRequested event detected - manual enrichment",
      );

      if (!this.temporalClient) {
        throw new Error("Temporal client not initialized");
      }

      // Fetch the target URI from the contract
      const targetData = (await publicClient.readContract({
        address: config.blockchain.contracts.etsTarget as `0x${string}`,
        abi: ETSTargetABI,
        functionName: "getTargetById",
        args: [targetId],
      })) as { targetURI: string; createdBy: string };

      const targetURI = targetData.targetURI;

      // Start Temporal workflow for target enrichment
      const workflowId = `existing-target-enrich-${targetId}-${Date.now()}`;
      await this.temporalClient.workflow.start("TargetEnrichmentWorkflow", {
        workflowId,
        taskQueue: config.temporal.taskQueue,
        args: [
          {
            targetId: targetId.toString(),
            targetURI,
          },
        ],
      });

      logger.info(
        {
          workflowId,
          targetId: targetId.toString(),
          targetURI,
          requestor,
        },
        "Started TargetEnrichmentWorkflow for enrichment request",
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
        "Failed to handle EnrichTargetRequested event",
      );
    }
  }

  private async handleTargetCreatedEvent(log: Log): Promise<void> {
    try {
      const { transactionHash, blockNumber } = log;
      const decoded = decodeEventLog({
        abi: [targetCreatedEvent],
        data: log.data,
        topics: log.topics,
      });
      const { targetId } = (decoded.args || {}) as { targetId: bigint };

      logger.info(
        {
          targetId: targetId.toString(),
          transactionHash,
          blockNumber: blockNumber?.toString(),
        },
        "🆕 TargetCreated event detected - automatic enrichment",
      );

      if (!this.temporalClient) {
        throw new Error("Temporal client not initialized");
      }

      // Fetch the target URI from the contract
      logger.info("Fetching target URI from contract...");
      const targetData = (await publicClient.readContract({
        address: config.blockchain.contracts.etsTarget as `0x${string}`,
        abi: ETSTargetABI,
        functionName: "getTargetById",
        args: [targetId],
      })) as { targetURI: string; createdBy: string };

      const targetURI = targetData.targetURI;
      logger.info({ targetURI }, "Target URI fetched");

      // Get block timestamp
      logger.info("Fetching block timestamp...");
      const block = await publicClient.getBlock({ blockNumber: blockNumber! });

      logger.info("Preparing workflow arguments...");
      const workflowArgs = {
        targetId: targetId.toString(),
        targetURI,
        transactionHash,
        blockNumber: blockNumber!.toString(),
        chainId: config.blockchain.chainId,
        timestamp: new Date(Number(block.timestamp) * 1000),
      };

      // Start Temporal workflow for target enrichment
      logger.info("Starting Temporal workflow...");
      const workflowId = `new-target-enrich-${targetId}-${Date.now()}`;
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
        abi: [tagCreatedEvent],
        data: log.data,
        topics: log.topics,
      });
      const { coinAddress, originalInput, displayVersion, machineName, creator, channel } = (decoded.args || {}) as {
        coinAddress: string;
        originalInput: string;
        displayVersion: string;
        machineName: string;
        creator: string;
        channel: string;
        timestamp: bigint;
      };

      logger.info(
        {
          coinAddress,
          originalInput,
          displayVersion,
          machineName,
          creator,
          channel,
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
            channel,
            transactionHash,
            blockNumber: blockNumber!.toString(),
            chainId: config.blockchain.chainId,
            timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
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
        "Failed to handle TagCreated event",
      );
    }
  }

  async stop(): Promise<void> {
    logger.info("Stopping event listener...");

    if (this.unwatchTargetCreated) {
      this.unwatchTargetCreated();
    }

    if (this.unwatchEnrichTargetRequested) {
      this.unwatchEnrichTargetRequested();
    }

    if (this.unwatchTagCreated) {
      this.unwatchTagCreated();
    }

    if (this.debugPollingInterval) {
      clearInterval(this.debugPollingInterval);
      this.debugPollingInterval = undefined;
    }

    if (this.temporalClient) {
      await this.temporalClient.connection.close();
    }

    this.isRunning = false;
    logger.info("Event listener stopped");
  }
}

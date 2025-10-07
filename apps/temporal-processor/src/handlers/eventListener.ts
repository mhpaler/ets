import { Client } from "@temporalio/client";
import {
  http,
  type Abi,
  type AbiEvent,
  type Log,
  type PublicClient,
  createPublicClient,
  decodeEventLog,
  webSocket,
} from "viem";
import { base, baseSepolia, localhost } from "viem/chains";
import { getConfig } from "../config";
import type { TagCreatedEvent, TargetCreatedEvent } from "../types";
import { CheckpointManager } from "../utils/checkpoint";
import { getComponentLogger } from "../utils/logger";

const logger = getComponentLogger("EventListener");

// Lazy-initialized clients
let httpClient: PublicClient | null = null;
let wsClient: PublicClient | null = null;
let watchClient: PublicClient | null = null;
let publicClient: PublicClient | null = null;

// Store ABIs and events (will be loaded asynchronously)
let ETSTargetABI: Abi;
let ETSTokenABI: Abi;
let targetCreatedEvent: AbiEvent;
let enrichTargetRequestedEvent: AbiEvent;
let tagCreatedEvent: AbiEvent;

// Get chain configuration based on chainId
function getChain(chainId: number) {
  switch (chainId) {
    case 31337:
      return localhost;
    case 84532:
      return baseSepolia;
    case 8453:
      return base;
    default:
      return localhost;
  }
}

// Initialize clients when needed
async function initializeClients() {
  if (httpClient) return { httpClient, wsClient, watchClient, publicClient };

  const config = await getConfig();

  // Create HTTP client for reliable read operations (getLogs, readContract)
  httpClient = createPublicClient({
    chain: getChain(config.blockchain.chainId),
    transport: http(config.blockchain.rpcUrl),
    batch: {
      multicall: true,
    },
  });

  // Create WebSocket client for real-time event watching (if available)
  wsClient = config.blockchain.wsRpcUrl
    ? createPublicClient({
        chain: getChain(config.blockchain.chainId),
        transport: webSocket(config.blockchain.wsRpcUrl, {
          reconnect: {
            attempts: 5,
            delay: 5000, // 5 seconds between retries
          },
          keepAlive: {
            interval: 30000, // ping every 30 seconds
          },
          timeout: 60000, // 60 second timeout
        }),
      })
    : null;

  // Use WebSocket for watching events (real-time), HTTP for queries
  watchClient = wsClient || httpClient;
  publicClient = httpClient; // Always use HTTP for read operations

  logger.info(
    {
      transport: wsClient ? "WebSocket" : "HTTP",
      wsUrl: config.blockchain.wsRpcUrl,
      httpUrl: config.blockchain.rpcUrl,
    },
    "Initialized blockchain clients",
  );

  return { httpClient, wsClient, watchClient, publicClient };
}

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
  private checkpointManager: CheckpointManager | null = null;
  private isRunning = false;
  private config: any = null;

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn("Event listener is already running");
      return;
    }

    try {
      // Get config first
      this.config = await getConfig();

      // Initialize checkpoint manager
      this.checkpointManager = new CheckpointManager(this.config.env);
      await this.checkpointManager.initialize();

      // Initialize clients
      await initializeClients();

      // Load ABIs
      await loadABIs();

      // Initialize Temporal client
      this.temporalClient = new Client({
        connection: {
          address: this.config.temporal.serverUrl,
        },
        namespace: this.config.temporal.namespace,
      });

      logger.info("Starting event listener...");
      logger.info({
        chainId: this.config.blockchain.chainId,
        rpcUrl: this.config.blockchain.rpcUrl,
        contracts: {
          etsTarget: this.config.blockchain.contracts.etsTarget,
          etsToken: this.config.blockchain.contracts.etsToken,
        },
      });

      this.isRunning = true;

      // Set up event listeners using watch methods
      await this.setupTargetCreatedListener();
      await this.setupEnrichTargetRequestedListener();
      await this.setupTagCreatedListener();

      // Start debug polling for real-time contract state updates (optional)
      if (this.config.env === "development" || this.config.env === "staging") {
        this.startDebugPolling();
      }

      logger.info("Event listener started successfully");
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        },
        "Failed to start event listener",
      );
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    logger.info("Stopping event listener...");

    // Clean up watchers
    if (this.unwatchTargetCreated) {
      this.unwatchTargetCreated();
    }
    if (this.unwatchEnrichTargetRequested) {
      this.unwatchEnrichTargetRequested();
    }
    if (this.unwatchTagCreated) {
      this.unwatchTagCreated();
    }

    // Stop debug polling
    if (this.debugPollingInterval) {
      clearInterval(this.debugPollingInterval);
    }

    // Close WebSocket connection if it exists
    if (wsClient && "close" in wsClient.transport) {
      try {
        await (wsClient.transport as any).close();
      } catch (error) {
        logger.warn({ error }, "Error closing WebSocket connection");
      }
    }

    this.isRunning = false;
    logger.info("Event listener stopped");
  }

  private async setupTargetCreatedListener(): Promise<void> {
    const config = this.config;
    const { watchClient: client, publicClient: reader } = await initializeClients();

    if (!client || !reader) {
      throw new Error("Clients not initialized");
    }

    logger.info(
      {
        contract: config.blockchain.contracts.etsTarget,
        event: "TargetCreated",
      },
      "Setting up TargetCreated event listener",
    );

    // Get the last processed block from checkpoint
    const lastBlock = this.checkpointManager!.getLastProcessedBlock();
    const fromBlock = lastBlock ? BigInt(lastBlock) + 1n : "latest";

    logger.info(
      {
        fromBlock: fromBlock.toString(),
        lastCheckpoint: lastBlock,
      },
      "Starting TargetCreated listener from checkpoint",
    );

    // Process historical events if we have a checkpoint
    if (lastBlock) {
      await this.processHistoricalTargetCreatedEvents(lastBlock);
    }

    // Watch for new events
    this.unwatchTargetCreated = client.watchContractEvent({
      address: config.blockchain.contracts.etsTarget,
      abi: ETSTargetABI,
      eventName: "TargetCreated",
      poll: true,
      pollingInterval: 5000, // Poll every 5 seconds
      onLogs: async (logs) => {
        for (const log of logs) {
          await this.handleTargetCreatedEvent(log);
        }
      },
      onError: (error) => {
        logger.error({ error }, "Error in TargetCreated watcher");
      },
    });
  }

  private async setupEnrichTargetRequestedListener(): Promise<void> {
    const config = this.config;
    const { watchClient: client } = await initializeClients();

    if (!client) {
      throw new Error("Clients not initialized");
    }

    logger.info(
      {
        contract: config.blockchain.contracts.etsTarget,
        event: "EnrichTargetRequested",
      },
      "Setting up EnrichTargetRequested event listener",
    );

    // Get the last processed block from checkpoint
    const lastBlock = this.checkpointManager!.getLastProcessedBlock();
    const fromBlock = lastBlock ? BigInt(lastBlock) + 1n : "latest";

    logger.info(
      {
        fromBlock: fromBlock.toString(),
        lastCheckpoint: lastBlock,
      },
      "Starting EnrichTargetRequested listener from checkpoint",
    );

    // Process historical events if we have a checkpoint
    if (lastBlock) {
      await this.processHistoricalEnrichTargetRequestedEvents(lastBlock);
    }

    // Watch for new events
    this.unwatchEnrichTargetRequested = client.watchContractEvent({
      address: config.blockchain.contracts.etsTarget,
      abi: ETSTargetABI,
      eventName: "EnrichTargetRequested",
      poll: true,
      pollingInterval: 5000, // Poll every 5 seconds
      onLogs: async (logs) => {
        for (const log of logs) {
          await this.handleEnrichTargetRequestedEvent(log);
        }
      },
      onError: (error) => {
        logger.error({ error }, "Error in EnrichTargetRequested watcher");
      },
    });
  }

  private async setupTagCreatedListener(): Promise<void> {
    const config = this.config;
    const { watchClient: client } = await initializeClients();

    if (!client) {
      throw new Error("Clients not initialized");
    }

    logger.info(
      {
        contract: config.blockchain.contracts.etsToken,
        event: "TagCreated",
      },
      "Setting up TagCreated event listener",
    );

    // Get the last processed block from checkpoint
    const lastBlock = this.checkpointManager!.getLastProcessedBlock();
    const fromBlock = lastBlock ? BigInt(lastBlock) + 1n : "latest";

    logger.info(
      {
        fromBlock: fromBlock.toString(),
        lastCheckpoint: lastBlock,
      },
      "Starting TagCreated listener from checkpoint",
    );

    // Process historical events if we have a checkpoint
    if (lastBlock) {
      await this.processHistoricalTagCreatedEvents(lastBlock);
    }

    // Watch for new events
    this.unwatchTagCreated = client.watchContractEvent({
      address: config.blockchain.contracts.etsToken,
      abi: ETSTokenABI,
      eventName: "TagCreated",
      poll: true,
      pollingInterval: 5000, // Poll every 5 seconds
      onLogs: async (logs) => {
        for (const log of logs) {
          await this.handleTagCreatedEvent(log);
        }
      },
      onError: (error) => {
        logger.error({ error }, "Error in TagCreated watcher");
      },
    });
  }

  private async processHistoricalTargetCreatedEvents(fromBlock: number): Promise<void> {
    const config = this.config;
    const { publicClient: client } = await initializeClients();

    if (!client) {
      throw new Error("Clients not initialized");
    }

    logger.info({ fromBlock }, "Processing historical TargetCreated events");

    try {
      const logs = await client.getContractEvents({
        address: config.blockchain.contracts.etsTarget,
        abi: ETSTargetABI,
        eventName: "TargetCreated",
        fromBlock: BigInt(fromBlock) + 1n,
        toBlock: "latest",
      });

      logger.info({ count: logs.length }, "Found historical TargetCreated events");

      for (const log of logs) {
        await this.handleTargetCreatedEvent(log);
      }
    } catch (error) {
      logger.error({ error }, "Failed to process historical TargetCreated events");
    }
  }

  private async processHistoricalEnrichTargetRequestedEvents(fromBlock: number): Promise<void> {
    const config = this.config;
    const { publicClient: client } = await initializeClients();

    if (!client) {
      throw new Error("Clients not initialized");
    }

    logger.info({ fromBlock }, "Processing historical EnrichTargetRequested events");

    try {
      const logs = await client.getContractEvents({
        address: config.blockchain.contracts.etsTarget,
        abi: ETSTargetABI,
        eventName: "EnrichTargetRequested",
        fromBlock: BigInt(fromBlock) + 1n,
        toBlock: "latest",
      });

      logger.info({ count: logs.length }, "Found historical EnrichTargetRequested events");

      for (const log of logs) {
        await this.handleEnrichTargetRequestedEvent(log);
      }
    } catch (error) {
      logger.error({ error }, "Failed to process historical EnrichTargetRequested events");
    }
  }

  private async processHistoricalTagCreatedEvents(fromBlock: number): Promise<void> {
    const config = this.config;
    const { publicClient: client } = await initializeClients();

    if (!client) {
      throw new Error("Clients not initialized");
    }

    logger.info({ fromBlock }, "Processing historical TagCreated events");

    try {
      const logs = await client.getContractEvents({
        address: config.blockchain.contracts.etsToken,
        abi: ETSTokenABI,
        eventName: "TagCreated",
        fromBlock: BigInt(fromBlock) + 1n,
        toBlock: "latest",
      });

      logger.info({ count: logs.length }, "Found historical TagCreated events");

      for (const log of logs) {
        await this.handleTagCreatedEvent(log);
      }
    } catch (error) {
      logger.error({ error }, "Failed to process historical TagCreated events");
    }
  }

  private async handleTargetCreatedEvent(log: Log): Promise<void> {
    const eventId = `${log.transactionHash}-${log.logIndex}`;

    // Skip if already processed
    if (this.processedEvents.has(eventId)) {
      return;
    }

    try {
      // Decode the event
      const decoded = decodeEventLog({
        abi: ETSTargetABI,
        data: log.data,
        topics: log.topics,
      }) as unknown as TargetCreatedEvent;

      logger.info(
        {
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          targetId: decoded.args.targetId?.toString(),
          targetURI: decoded.args.targetURI,
        },
        "Processing TargetCreated event",
      );

      // Mark as processed before starting workflow to avoid race conditions
      this.processedEvents.add(eventId);

      // Start Temporal workflow for target enrichment
      if (this.temporalClient) {
        const workflowId = `target-enrichment-${decoded.args.targetId}`;

        try {
          await this.temporalClient.workflow.start("TargetEnrichmentWorkflow", {
            taskQueue: this.config.temporal.taskQueue,
            workflowId,
            args: [
              {
                targetId: decoded.args.targetId?.toString() || "0",
                targetURI: decoded.args.targetURI,
                createdBy: decoded.args.createdBy,
                blockNumber: log.blockNumber?.toString(),
                transactionHash: log.transactionHash,
              },
            ],
          });

          logger.info({ workflowId }, "Started TargetEnrichmentWorkflow");
        } catch (error: any) {
          if (error.code === 6) {
            // ALREADY_EXISTS
            logger.debug({ workflowId }, "Workflow already exists, skipping");
          } else {
            logger.error(
              {
                error: error instanceof Error ? error.message : error,
                code: error?.code,
                details: error?.details,
                stack: error instanceof Error ? error.stack : undefined,
                workflowId,
              },
              "Failed to start workflow",
            );
          }
        }
      }

      // Update checkpoint
      if (log.blockNumber) {
        await this.checkpointManager!.updateProcessedEvents(
          BigInt(log.blockNumber),
          this.config.blockchain.chainId,
          {
            etsTarget: this.config.blockchain.contracts.etsTarget,
            etsToken: this.config.blockchain.contracts.etsToken,
          },
          [eventId],
        );
      }
    } catch (error) {
      logger.error({ error, log }, "Failed to handle TargetCreated event");
      // Remove from processed set so it can be retried
      this.processedEvents.delete(eventId);
    }
  }

  private async handleEnrichTargetRequestedEvent(log: Log): Promise<void> {
    const eventId = `${log.transactionHash}-${log.logIndex}`;

    // Skip if already processed
    if (this.processedEvents.has(eventId)) {
      return;
    }

    try {
      // Decode the event
      const decoded = decodeEventLog({
        abi: ETSTargetABI,
        data: log.data,
        topics: log.topics,
      });

      logger.info(
        {
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          targetId: (decoded.args as any).targetId?.toString(),
          requestedBy: (decoded.args as any).requestedBy,
        },
        "Processing EnrichTargetRequested event",
      );

      // Mark as processed
      this.processedEvents.add(eventId);

      // Start Temporal workflow for target enrichment
      if (this.temporalClient) {
        const workflowId = `target-enrichment-${(decoded.args as any).targetId}`;

        try {
          // Get target details first
          const { publicClient: client } = await initializeClients();
          if (client) {
            const targetURI = await client.readContract({
              address: this.config.blockchain.contracts.etsTarget,
              abi: ETSTargetABI,
              functionName: "getTargetURI",
              args: [(decoded.args as any).targetId],
            });

            await this.temporalClient.workflow.start("TargetEnrichmentWorkflow", {
              taskQueue: this.config.temporal.taskQueue,
              workflowId,
              args: [
                {
                  targetId: (decoded.args as any).targetId?.toString() || "0",
                  targetURI: targetURI as string,
                  createdBy: (decoded.args as any).requestedBy,
                  blockNumber: log.blockNumber?.toString(),
                  transactionHash: log.transactionHash,
                },
              ],
            });

            logger.info({ workflowId }, "Started TargetEnrichmentWorkflow from EnrichTargetRequested");
          }
        } catch (error: any) {
          if (error.code === 6) {
            // ALREADY_EXISTS
            logger.debug({ workflowId }, "Workflow already exists, skipping");
          } else {
            logger.error(
              {
                error: error instanceof Error ? error.message : error,
                code: error?.code,
                details: error?.details,
                stack: error instanceof Error ? error.stack : undefined,
                workflowId,
              },
              "Failed to start workflow",
            );
          }
        }
      }

      // Update checkpoint
      if (log.blockNumber) {
        await this.checkpointManager!.updateProcessedEvents(
          BigInt(log.blockNumber),
          this.config.blockchain.chainId,
          {
            etsTarget: this.config.blockchain.contracts.etsTarget,
            etsToken: this.config.blockchain.contracts.etsToken,
          },
          [eventId],
        );
      }
    } catch (error) {
      logger.error({ error, log }, "Failed to handle EnrichTargetRequested event");
      // Remove from processed set so it can be retried
      this.processedEvents.delete(eventId);
    }
  }

  private async handleTagCreatedEvent(log: Log): Promise<void> {
    const eventId = `${log.transactionHash}-${log.logIndex}`;

    // Skip if already processed
    if (this.processedEvents.has(eventId)) {
      return;
    }

    try {
      // Decode the event
      const decoded = decodeEventLog({
        abi: ETSTokenABI,
        data: log.data,
        topics: log.topics,
      }) as unknown as TagCreatedEvent;

      logger.info(
        {
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          tagId: decoded.args.tagId?.toString(),
          display: decoded.args.display,
          creator: decoded.args.creator,
        },
        "Processing TagCreated event",
      );

      // Mark as processed
      this.processedEvents.add(eventId);

      // Start Temporal workflow for TAG coin deployment
      if (this.temporalClient) {
        const workflowId = `tag-coin-${decoded.args.tagId}`;

        try {
          await this.temporalClient.workflow.start("TagCreatedWorkflow", {
            taskQueue: this.config.temporal.taskQueue,
            workflowId,
            args: [
              {
                tagId: decoded.args.tagId?.toString() || "0",
                display: decoded.args.display,
                creator: decoded.args.creator,
                blockNumber: log.blockNumber?.toString(),
                transactionHash: log.transactionHash,
              },
            ],
          });

          logger.info({ workflowId }, "Started TagCreatedWorkflow");
        } catch (error: any) {
          if (error.code === 6) {
            // ALREADY_EXISTS
            logger.debug({ workflowId }, "Workflow already exists, skipping");
          } else {
            logger.error(
              {
                error: error instanceof Error ? error.message : error,
                code: error?.code,
                details: error?.details,
                stack: error instanceof Error ? error.stack : undefined,
                workflowId,
              },
              "Failed to start workflow",
            );
          }
        }
      }

      // Update checkpoint
      if (log.blockNumber) {
        await this.checkpointManager!.updateProcessedEvents(
          BigInt(log.blockNumber),
          this.config.blockchain.chainId,
          {
            etsTarget: this.config.blockchain.contracts.etsTarget,
            etsToken: this.config.blockchain.contracts.etsToken,
          },
          [eventId],
        );
      }
    } catch (error) {
      logger.error({ error, log }, "Failed to handle TagCreated event");
      // Remove from processed set so it can be retried
      this.processedEvents.delete(eventId);
    }
  }

  private startDebugPolling(): void {
    this.debugPollingInterval = setInterval(async () => {
      try {
        const { publicClient: client } = await initializeClients();
        if (!client) return;

        const config = this.config;
        const blockNumber = await client.getBlockNumber();

        logger.info(
          `🔄 Polling debug: Latest block ${blockNumber}, watching contract ${config.blockchain.contracts.etsTarget}`,
        );
      } catch (error) {
        logger.warn({ error }, "Debug polling error");
      }
    }, 10000); // Poll every 10 seconds
  }
}

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { NativeConnection, Worker } from "@temporalio/worker";
import {
  allocateCreatorRewards,
  createTagCoinMetadata,
  deployTagCoinOnZora,
  fetchPoolConfig,
} from "./activities/tagCoinActivities.js";
import { callEnrichTargetOnChain, fetchTargetMetadata } from "./activities/targetEnrichmentActivities.js";

const activities = {
  fetchTargetMetadata,
  callEnrichTargetOnChain,
  createTagCoinMetadata,
  fetchPoolConfig,
  deployTagCoinOnZora,
  allocateCreatorRewards,
};
import { getConfig } from "./config/index.js";
import { getComponentLogger } from "./utils/logger.js";

const logger = getComponentLogger("Worker");

// Store worker and connection instances globally for cleanup
let worker: Worker | null = null;
let connection: NativeConnection | null = null;

// Cleanup function for graceful shutdown
export async function cleanupWorker() {
  if (worker) {
    logger.info("Shutting down worker...");
    try {
      worker.shutdown();
      worker = null;
    } catch (error) {
      logger.error({ error }, "Error shutting down worker");
    }
  }

  if (connection) {
    logger.info("Closing connection...");
    try {
      await connection.close();
      connection = null;
    } catch (error) {
      logger.error({ error }, "Error closing connection");
    }
  }
}

export async function startWorker() {
  // Clean up any existing instances first (important for hot-reload)
  await cleanupWorker();

  // Resolve directory path for ESM modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  try {
    logger.info("🚀 Starting Temporal worker...");

    // Load config asynchronously
    const config = await getConfig();

    logger.info(
      {
        isCloud: config.temporal.isCloud,
        serverUrl: config.temporal.serverUrl,
        namespace: config.temporal.namespace,
      },
      "Connection configuration",
    );

    // Create connection to Temporal server (supports both local and cloud)
    const connectionOptions: any = {
      address: config.temporal.serverUrl,
    };

    // Add authentication for Temporal Cloud
    if (config.temporal.isCloud) {
      if (config.temporal.apiKey) {
        // API Key authentication
        logger.info("Configuring Temporal Cloud connection with API Key");
        connectionOptions.tls = true; // Enable TLS for cloud
        connectionOptions.apiKey = config.temporal.apiKey;
      } else {
        throw new Error("Temporal Cloud requires TEMPORAL_API_KEY environment variable");
      }
    }

    connection = await NativeConnection.connect(connectionOptions);

    // Create worker that hosts both workflows and activities
    worker = await Worker.create({
      connection,
      namespace: config.temporal.namespace,
      taskQueue: config.temporal.taskQueue,
      workflowsPath: join(__dirname, "workflows"),
      activities,
      identity: config.temporal.workerId,
      // Limit concurrent on-chain activities to prevent nonce conflicts
      // Metadata fetching can still happen in parallel since it doesn't use blockchain
      maxConcurrentActivityTaskExecutions: 3, // Conservative limit to reduce nonce contention
      maxConcurrentWorkflowTaskExecutions: config.worker.maxConcurrentWorkflows,
    });

    logger.info(
      {
        workerId: config.temporal.workerId,
        taskQueue: config.temporal.taskQueue,
        namespace: config.temporal.namespace,
        serverUrl: config.temporal.serverUrl,
      },
      "Worker configuration",
    );

    // Start the worker
    await worker.run();
    logger.info("✅ Temporal worker started successfully");
  } catch (err) {
    logger.error(
      {
        error: err instanceof Error ? err.message : err,
        stack: err instanceof Error ? err.stack : undefined,
      },
      "Failed to start worker",
    );
    process.exit(1);
  }
}

// Worker is now started from index.ts

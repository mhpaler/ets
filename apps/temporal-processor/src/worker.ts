import { NativeConnection, Worker } from "@temporalio/worker";
import {
  allocateCreatorRewards,
  createTagCoinMetadata,
  deployTagCoinOnZora,
  fetchPoolConfig,
} from "./activities/tagCoinActivities";
import { callEnrichTargetOnChain, fetchTargetMetadata } from "./activities/targetEnrichmentActivities";

const activities = {
  fetchTargetMetadata,
  callEnrichTargetOnChain,
  createTagCoinMetadata,
  fetchPoolConfig,
  deployTagCoinOnZora,
  allocateCreatorRewards,
};
import { getConfig } from "./config";
import { getComponentLogger } from "./utils/logger";

const logger = getComponentLogger("Worker");

// Store worker and connection instances globally for cleanup
let worker: Worker | null = null;
let connection: NativeConnection | null = null;

// Cleanup function for graceful shutdown
async function cleanup() {
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

async function run() {
  // Clean up any existing instances first (important for hot-reload)
  await cleanup();

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

    // Add TLS configuration for Temporal Cloud
    if (config.temporal.isCloud) {
      logger.info("Configuring Temporal Cloud connection with TLS");
      connectionOptions.tls = {
        clientCertPair: {
          crt: Buffer.from(config.temporal.clientCert!, "base64"),
          key: Buffer.from(config.temporal.clientKey!, "base64"),
        },
      };
    }

    connection = await NativeConnection.connect(connectionOptions);

    // Create worker that hosts both workflows and activities
    worker = await Worker.create({
      connection,
      namespace: config.temporal.namespace,
      taskQueue: config.temporal.taskQueue,
      workflowsPath: require.resolve("./workflows"),
      activities,
      identity: config.temporal.workerId,
      maxConcurrentActivityTaskExecutions: config.worker.maxConcurrentActivities,
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
        stack: err instanceof Error ? err.stack : undefined
      },
      "Failed to start worker"
    );
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Received SIGINT, shutting down worker gracefully...");
  await cleanup();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM, shutting down worker gracefully...");
  await cleanup();
  process.exit(0);
});

// Handle tsx --watch reload events (SIGUSR2 is sent by tsx before reload)
process.on("SIGUSR2", async () => {
  logger.info("Received SIGUSR2 (hot-reload), cleaning up worker...");
  await cleanup();
});

// Start the worker
run().catch((err) => {
  logger.error({ error: err }, "Uncaught error in worker");
  process.exit(1);
});

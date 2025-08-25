import { NativeConnection, Worker } from "@temporalio/worker";
import { allocateCreatorRewards, createTagCoinMetadata, deployTagCoinOnZora } from "./activities/tagCoinActivities";
import { fetchTargetMetadata, updateTargetOnChain, uploadToArweave } from "./activities/targetEnrichmentActivities";

const activities = {
  fetchTargetMetadata,
  uploadToArweave,
  updateTargetOnChain,
  createTagCoinMetadata,
  deployTagCoinOnZora,
  allocateCreatorRewards,
};
import { config } from "./config";
import { getComponentLogger } from "./utils/logger";

const logger = getComponentLogger("Worker");

async function run() {
  try {
    logger.info("🚀 Starting Temporal worker...");
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

    const connection = await NativeConnection.connect(connectionOptions);

    // Create worker that hosts both workflows and activities
    const worker = await Worker.create({
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
    logger.error({ error: err }, "Failed to start worker");
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Received SIGINT, shutting down worker gracefully...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM, shutting down worker gracefully...");
  process.exit(0);
});

// Start the worker
run().catch((err) => {
  logger.error({ error: err }, "Uncaught error in worker");
  process.exit(1);
});

import fs from "node:fs/promises";
import path from "node:path";
import { getComponentLogger } from "./logger.js";

const logger = getComponentLogger("Checkpoint");

interface Checkpoint {
  lastProcessedBlock: bigint;
  chainId: number;
  contractAddresses: {
    etsTarget: string;
    etsToken: string;
  };
  lastUpdated: string;
  processedEvents: string[]; // Last 100 event IDs for deduplication
}

export class CheckpointManager {
  private checkpointPath: string;
  private checkpoint: Checkpoint | null = null;

  constructor(env = "development") {
    // Store checkpoint in a .checkpoint directory
    const checkpointDir = path.join(process.cwd(), ".checkpoint");
    this.checkpointPath = path.join(checkpointDir, `${env}-checkpoint.json`);
  }

  async initialize(): Promise<void> {
    try {
      // Ensure checkpoint directory exists
      const dir = path.dirname(this.checkpointPath);
      await fs.mkdir(dir, { recursive: true });

      // Try to load existing checkpoint
      await this.load();
    } catch (_error) {
      logger.warn("No existing checkpoint found, will create new one");
    }
  }

  async load(): Promise<Checkpoint | null> {
    try {
      const data = await fs.readFile(this.checkpointPath, "utf-8");
      const checkpoint = JSON.parse(data, (key, value) => {
        // Convert lastProcessedBlock back to bigint
        if (key === "lastProcessedBlock" && typeof value === "string") {
          return BigInt(value);
        }
        return value;
      });

      this.checkpoint = checkpoint;
      logger.info(`Loaded checkpoint from block ${checkpoint.lastProcessedBlock}`);
      return checkpoint;
    } catch (_error) {
      return null;
    }
  }

  async save(checkpoint: Checkpoint): Promise<void> {
    try {
      // Keep only last 100 processed events to prevent file from growing too large
      if (checkpoint.processedEvents.length > 100) {
        checkpoint.processedEvents = checkpoint.processedEvents.slice(-100);
      }

      // Convert bigint to string for JSON serialization
      const data = JSON.stringify(
        checkpoint,
        (key, value) => {
          if (key === "lastProcessedBlock" && typeof value === "bigint") {
            return value.toString();
          }
          return value;
        },
        2,
      );

      await fs.writeFile(this.checkpointPath, data, "utf-8");
      this.checkpoint = checkpoint;
      logger.debug(`Saved checkpoint at block ${checkpoint.lastProcessedBlock}`);
    } catch (error) {
      logger.error({ error }, "Failed to save checkpoint");
    }
  }

  async detectChainReset(
    currentBlock: bigint,
    currentChainId: number,
    currentContracts: { etsTarget: string; etsToken: string },
  ): Promise<boolean> {
    if (!this.checkpoint) {
      return false;
    }

    // Check for chain reset conditions
    const isReset =
      // Block number went backwards (Hardhat restart)
      currentBlock < this.checkpoint.lastProcessedBlock ||
      // Chain ID changed
      currentChainId !== this.checkpoint.chainId ||
      // Contract addresses changed (redeployment)
      currentContracts.etsTarget.toLowerCase() !== this.checkpoint.contractAddresses.etsTarget.toLowerCase() ||
      currentContracts.etsToken.toLowerCase() !== this.checkpoint.contractAddresses.etsToken.toLowerCase();

    if (isReset) {
      logger.warn("⚠️  Chain reset detected! Clearing checkpoint...");
      logger.info(
        {
          old: {
            block: this.checkpoint.lastProcessedBlock.toString(),
            chainId: this.checkpoint.chainId,
            contracts: this.checkpoint.contractAddresses,
          },
          new: {
            block: currentBlock.toString(),
            chainId: currentChainId,
            contracts: currentContracts,
          },
        },
        "Chain state comparison",
      );

      // Clear the checkpoint
      await this.clear();
      return true;
    }

    return false;
  }

  async clear(): Promise<void> {
    try {
      await fs.unlink(this.checkpointPath);
      this.checkpoint = null;
      logger.info("Checkpoint cleared");
    } catch (_error) {
      // File might not exist, that's ok
    }
  }

  getLastProcessedBlock(): bigint | null {
    return this.checkpoint?.lastProcessedBlock ?? null;
  }

  hasProcessedEvent(eventId: string): boolean {
    return this.checkpoint?.processedEvents.includes(eventId) ?? false;
  }

  async updateProcessedEvents(
    block: bigint,
    chainId: number,
    contracts: { etsTarget: string; etsToken: string },
    newEventIds: string[],
  ): Promise<void> {
    const checkpoint: Checkpoint = {
      lastProcessedBlock: block,
      chainId,
      contractAddresses: contracts,
      lastUpdated: new Date().toISOString(),
      processedEvents: [...(this.checkpoint?.processedEvents ?? []), ...newEventIds],
    };

    await this.save(checkpoint);
  }
}

import { logger } from "../../utils/logger";

// Types for our processing status tracking
export type ProcessingStatus =
  | "pending"
  | "processing"
  | "metadata_generated"
  | "coin_creating"
  | "completed"
  | "failed";

export interface ProcessingRecord {
  id?: number;
  tagString: string;
  machineName: string;
  creatorAddress: string;
  relayerAddress: string;

  // ETS event data
  etsTagId?: string;
  etsBlockNumber?: bigint;
  etsTransactionHash?: string;

  // Processing state
  status: ProcessingStatus;
  attempts: number;
  lastError?: string;

  // Zora results
  predictedCoinAddress?: string;
  actualCoinAddress?: string;
  zoraTransactionHash?: string;
  zoraBlockNumber?: bigint;

  // Metadata
  metadataUri?: string;
  metadataGeneratedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

/**
 * Service for managing coin processing status
 *
 * This is a simplified in-memory implementation for now.
 * In production, this would be backed by PostgreSQL.
 */
export class ProcessingStatusService {
  private records: Map<string, ProcessingRecord> = new Map();
  private nextId = 1;

  constructor() {
    logger.info("ProcessingStatusService initialized (in-memory mode)");
  }

  /**
   * Create a new processing record
   */
  async createRecord(data: {
    tagString: string;
    machineName: string;
    creatorAddress: string;
    relayerAddress: string;
    etsTagId?: string;
    etsBlockNumber?: bigint;
    etsTransactionHash?: string;
  }): Promise<ProcessingRecord> {
    const key = this.getRecordKey(data.tagString, data.creatorAddress);

    // Check if record already exists
    const existing = this.records.get(key);
    if (existing) {
      logger.info("Processing record already exists", {
        tagString: data.tagString,
        creatorAddress: data.creatorAddress,
        status: existing.status,
      });
      return existing;
    }

    const record: ProcessingRecord = {
      id: this.nextId++,
      ...data,
      status: "pending",
      attempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.records.set(key, record);

    logger.info("Created processing record", {
      id: record.id,
      tagString: record.tagString,
      status: record.status,
    });

    return record;
  }

  /**
   * Update processing record status
   */
  async updateStatus(
    tagString: string,
    creatorAddress: string,
    updates: {
      status?: ProcessingStatus;
      attempts?: number;
      lastError?: string;
      predictedCoinAddress?: string;
      actualCoinAddress?: string;
      zoraTransactionHash?: string;
      zoraBlockNumber?: bigint;
      metadataUri?: string;
      metadataGeneratedAt?: Date;
    },
  ): Promise<ProcessingRecord | null> {
    const key = this.getRecordKey(tagString, creatorAddress);
    const record = this.records.get(key);

    if (!record) {
      logger.warn("Processing record not found for update", {
        tagString,
        creatorAddress,
      });
      return null;
    }

    // Apply updates
    Object.assign(record, updates);
    record.updatedAt = new Date();

    // Set completion time if status is completed or failed
    if (updates.status === "completed" || updates.status === "failed") {
      record.completedAt = new Date();
    }

    this.records.set(key, record);

    logger.info("Updated processing record", {
      id: record.id,
      tagString: record.tagString,
      oldStatus: record.status,
      newStatus: updates.status || record.status,
      attempts: record.attempts,
    });

    return record;
  }

  /**
   * Get processing record
   */
  async getRecord(tagString: string, creatorAddress: string): Promise<ProcessingRecord | null> {
    const key = this.getRecordKey(tagString, creatorAddress);
    return this.records.get(key) || null;
  }

  /**
   * Get records by status
   */
  async getRecordsByStatus(status: ProcessingStatus): Promise<ProcessingRecord[]> {
    return Array.from(this.records.values()).filter((record) => record.status === status);
  }

  /**
   * Get all active (non-completed, non-failed) records
   */
  async getActiveRecords(): Promise<ProcessingRecord[]> {
    return Array.from(this.records.values()).filter((record) => !["completed", "failed"].includes(record.status));
  }

  /**
   * Get processing statistics
   */
  async getStats(): Promise<{
    total: number;
    byStatus: Record<ProcessingStatus, number>;
    averageProcessingTime?: number;
  }> {
    const records = Array.from(this.records.values());
    const byStatus: Record<ProcessingStatus, number> = {
      pending: 0,
      processing: 0,
      metadata_generated: 0,
      coin_creating: 0,
      completed: 0,
      failed: 0,
    };

    let totalProcessingTime = 0;
    let completedCount = 0;

    for (const record of records) {
      byStatus[record.status]++;

      if (record.completedAt) {
        const processingTime = record.completedAt.getTime() - record.createdAt.getTime();
        totalProcessingTime += processingTime;
        completedCount++;
      }
    }

    return {
      total: records.length,
      byStatus,
      averageProcessingTime: completedCount > 0 ? totalProcessingTime / completedCount : undefined,
    };
  }

  /**
   * Clean up old completed/failed records
   */
  async cleanup(olderThanMs: number = 24 * 60 * 60 * 1000): Promise<number> {
    const cutoffTime = Date.now() - olderThanMs;
    let cleaned = 0;

    for (const [key, record] of this.records.entries()) {
      if (["completed", "failed"].includes(record.status) && record.updatedAt.getTime() < cutoffTime) {
        this.records.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info("Cleaned up old processing records", { cleaned });
    }

    return cleaned;
  }

  /**
   * Generate unique key for tag/creator combination
   */
  private getRecordKey(tagString: string, creatorAddress: string): string {
    return `${tagString.toLowerCase()}:${creatorAddress.toLowerCase()}`;
  }
}

export default ProcessingStatusService;

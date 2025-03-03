import fs from "node:fs";
import Arweave from "arweave";
import { config } from "../../config";
import { getMockMetadataForContentType } from "../../mocks/mockMetadata";
import { logger } from "../../utils/logger";

export class ArweaveService {
  private arweave: Arweave;
  private jwk: any;
  private isMock: boolean;

  constructor() {
    // Log the mock setting
    console.info("ArweaveService initializing with mockArweave:", config.arweave.mockArweave);
    this.isMock = config.arweave.mockArweave;

    this.arweave = Arweave.init({
      host: new URL(config.arweave.gateway).hostname,
      port: 443,
      protocol: "https",
    });

    if (this.isMock) {
      console.info("Using mock Arweave key");
      this.jwk = {
        kty: "RSA",
        n: "mock-dev-only",
        e: "AQAB",
        d: "mock-key",
        p: "mock-key",
        q: "mock-key",
        dp: "mock-key",
        dq: "mock-key",
        qi: "mock-key",
      };
      console.info("Mock Arweave key set");
    } else {
      this.loadRealKey();
    }

    if (this.isMock) {
      logger.warn("ArweaveService initialized in MOCK mode. No actual Arweave transactions will be created.");
    } else {
      logger.info("ArweaveService initialized in PRODUCTION mode. Real Arweave transactions will be created.");
    }
  }

  /**
   * Load the Arweave JWK from file
   */
  private loadRealKey(): void {
    try {
      console.info("Attempting to load Arweave key from:", config.arweave.keyfilePath);
      const rawKey = fs.readFileSync(config.arweave.keyfilePath, "utf-8");
      this.jwk = JSON.parse(rawKey);
      console.info("Arweave JWK loaded successfully");
    } catch (error) {
      console.error(`Failed to load Arweave JWK from ${config.arweave.keyfilePath}:`, error);
      throw new Error("Failed to load Arweave JWK");
    }
  }

  /**
   * Get wallet address from the loaded JWK
   */
  public async getWalletAddress(): Promise<string> {
    if (this.isMock) {
      return "0xMockArweaveAddress";
    }

    try {
      return await this.arweave.wallets.jwkToAddress(this.jwk);
    } catch (error) {
      logger.error("Failed to get wallet address:", error);
      throw new Error("Failed to get Arweave wallet address");
    }
  }

  /**
   * Get wallet balance in AR
   */
  public async getWalletBalance(): Promise<string> {
    if (this.isMock) {
      return "999.999";
    }

    try {
      const address = await this.getWalletAddress();
      const winstonBalance = await this.arweave.wallets.getBalance(address);
      return this.arweave.ar.winstonToAr(winstonBalance);
    } catch (error) {
      logger.error("Failed to get wallet balance:", error);
      throw new Error("Failed to get Arweave wallet balance");
    }
  }

  /**
   * Upload data to Arweave and return the transaction ID (hash)
   * If in mock mode, returns a deterministic mock transaction ID with content type awareness
   */
  public async uploadData(
    data: string | Buffer,
    contentType = "application/json",
    tags: { name: string; value: string }[] = [],
  ): Promise<string> {
    // Create a hash of the data to generate a deterministic mock ID
    const hashData = (input: string | Buffer): string => {
      const str = typeof input === "string" ? input : input.toString("utf-8");
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash).toString(16).padStart(8, "0");
    };

    if (this.isMock) {
      // Use a local copy of data that we can modify
      let processedData = data;

      // Extract content type from tags or use the provided contentType
      let dataContentType = contentType;
      const contentTypeTag = tags.find((tag) => tag.name === "Content-Type");
      if (contentTypeTag) {
        dataContentType = contentTypeTag.value;
      }

      // Generate mock ID that includes content type info
      const timestamp = Date.now().toString(16);
      const contentHash = hashData(processedData);
      const contentTypeCode = dataContentType.replace(/[^a-z0-9]/gi, "_").substring(0, 5);
      const mockTxId = `MOCK_${contentTypeCode}_${contentHash}_${timestamp}`;

      // For metadata uploads, if this is JSON data, we can enhance it with mock data
      // based on the content type mentioned in the data
      if (contentType === "application/json" && typeof processedData === "string") {
        try {
          const jsonData = JSON.parse(processedData);
          // If this is target metadata and has a content type
          if (tags.some((tag) => tag.name === "Type" && tag.value === "target-metadata") && jsonData.contentType) {
            // Log the metadata content type for debugging
            logger.debug(`[MOCK] Metadata content type: ${jsonData.contentType}`);

            // Enhance with mock data if needed
            // This is mostly for development/testing to provide richer mock data
            if (process.env.ENHANCE_MOCK_METADATA === "true") {
              const mockEnhancements = getMockMetadataForContentType(jsonData.contentType);
              // We only add missing fields, don't override existing ones
              for (const [key, value] of Object.entries(mockEnhancements)) {
                if (jsonData[key] === undefined || jsonData[key] === "") {
                  jsonData[key] = value;
                }
              }
              // Create enhanced version without modifying the original parameter
              processedData = JSON.stringify(jsonData, null, 2);
              logger.debug("[MOCK] Enhanced metadata with mock data");
            }
          }
        } catch (e) {
          // If JSON parsing fails, just continue with original data
          logger.debug("Not valid JSON or couldn't enhance mock data:", e);
        }
      }

      // Log tags for debugging
      const tagString = tags.map((t) => `${t.name}: ${t.value}`).join(", ");

      logger.info(`[MOCK] Uploaded data to Arweave with transaction ID: ${mockTxId}`);
      logger.info(`[MOCK] Content type: ${dataContentType}`);
      logger.info(`[MOCK] Tags: ${tagString}`);

      return mockTxId;
    }

    try {
      // The rest of the real Arweave upload logic remains the same
      let tx: any;

      if (typeof data === "string") {
        tx = await this.arweave.createTransaction({ data }, this.jwk);
      } else {
        tx = await this.arweave.createTransaction({ data: data }, this.jwk);
      }

      // Add content type
      tx.addTag("Content-Type", contentType);

      // Add custom tags
      for (const tag of tags) {
        tx.addTag(tag.name, tag.value);
      }

      // Always add ETS tags for easy identification
      tx.addTag("App-Name", "Ethereum-Tag-Service");
      tx.addTag("App-Version", "1.0.0");

      // Sign the transaction
      await this.arweave.transactions.sign(tx, this.jwk);

      // Calculate the cost in AR
      const winston = tx.reward;
      const ar = this.arweave.ar.winstonToAr(winston);
      logger.info(`Transaction cost: ${ar} AR`);

      // Submit the transaction
      const response = await this.arweave.transactions.post(tx);

      if (response.status !== 200) {
        throw new Error(`Failed to submit transaction: ${response.statusText}`);
      }

      logger.info(`Data uploaded to Arweave with transaction ID: ${tx.id}`);
      return tx.id;
    } catch (error) {
      logger.error("Failed to upload data to Arweave:", error);
      throw new Error("Failed to upload data to Arweave");
    }
  }

  /**
   * Upload metadata for a target
   * @param targetId The target ID
   * @param metadata The metadata object
   * @returns Transaction ID (hash)
   */
  public async uploadTargetMetadata(targetId: string, metadata: any): Promise<string> {
    const data = JSON.stringify(metadata);
    const tags = [
      { name: "Target-ID", value: targetId },
      { name: "Content-Type", value: "application/json" },
      { name: "Type", value: "target-metadata" },
    ];

    return this.uploadData(data, "application/json", tags);
  }

  /**
   * Get the URL for a transaction
   * @param txId Transaction ID
   * @returns Full URL to access the content
   */
  public getTransactionUrl(txId: string): string {
    if (this.isMock && txId.startsWith("MOCK_")) {
      return `${config.arweave.gateway}/mock/${txId}`;
    }
    return `${config.arweave.gateway}/${txId}`;
  }
}

export const arweaveService = new ArweaveService();

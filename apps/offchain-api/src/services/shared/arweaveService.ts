import fs from "node:fs";
import Arweave from "arweave";
import axios from "axios";
import { config } from "../../config";
import { getMockMetadataForContentType } from "../../mocks/mockMetadata";
import { logger } from "../../utils/logger";

export class ArweaveService {
  private arweave: Arweave;
  private jwk: any;
  private isMock: boolean;

  constructor() {
    // Log the mock setting
    logger.info({ mockArweave: config.arweave.mockArweave }, "ArweaveService initializing");
    this.isMock = config.arweave.mockArweave;

    // Check if we're using local Arweave
    const isArLocal = config.arweave.gateway.includes("localhost") || config.arweave.gateway.includes("127.0.0.1");

    if (!this.isMock && isArLocal) {
      this.checkArLocalRunning();
    }

    this.arweave = Arweave.init({
      host: new URL(config.arweave.gateway).hostname,
      port: isArLocal ? 1984 : 443,
      protocol: isArLocal ? "http" : "https",
    });

    if (this.isMock) {
      logger.info("Using mock Arweave key");
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
      logger.info("Mock Arweave key set");
    } else {
      this.loadRealKey();
    }

    // Better logging for different modes
    if (this.isMock) {
      logger.warn("💡 ArweaveService initialized in MOCK mode. No actual Arweave transactions will be created.");
    } else if (isArLocal) {
      logger.warn("🧪 ArweaveService initialized in ARLOCAL TESTING mode!");
      logger.warn({ gateway: config.arweave.gateway }, "Connected to LOCAL Arweave instance");
      logger.warn("📌 This is NOT the production Arweave network - data will be stored locally only");
    } else {
      logger.warn("⚠️ ArweaveService initialized in PRODUCTION mode. Real Arweave transactions will be created!");
      logger.warn({ gateway: config.arweave.gateway }, "Connected to REAL Arweave network");
    }
  }

  /**
   * Load the Arweave JWK from file
   */
  private loadRealKey(): void {
    try {
      logger.info({ keyfilePath: config.arweave.keyfilePath }, "Attempting to load Arweave key");
      const rawKey = fs.readFileSync(config.arweave.keyfilePath, "utf-8");
      this.jwk = JSON.parse(rawKey);
      logger.info("Arweave JWK loaded successfully");
    } catch (error) {
      logger.error(
        {
          keyfilePath: config.arweave.keyfilePath,
          error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
        },
        "Failed to load Arweave JWK",
      );
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
      logger.error(
        {
          error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
        },
        "Failed to get wallet address",
      );
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
      logger.error(
        {
          error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
        },
        "Failed to get wallet balance",
      );
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
            logger.debug({ contentType: jsonData.contentType }, "Metadata content type for mock data");

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
              logger.debug("Enhanced metadata with mock data");
            }
          }
        } catch (e) {
          // If JSON parsing fails, just continue with original data
          logger.debug({ error: e }, "Not valid JSON or couldn't enhance mock data");
        }
      }

      // Log tags for debugging
      logger.info(
        {
          txId: mockTxId,
          contentType: dataContentType,
          tags,
        },
        "Mock data uploaded to Arweave",
      );

      return mockTxId;
    }

    try {
      // More detailed logging for debugging
      logger.info(
        {
          contentType,
          dataSize: typeof data === "string" ? data.length : data.byteLength,
          tagsCount: tags.length,
        },
        "Creating Arweave transaction",
      );

      // Create transaction
      let tx: any;

      if (typeof data === "string") {
        tx = await this.arweave.createTransaction({ data }, this.jwk);
      } else {
        tx = await this.arweave.createTransaction({ data: data }, this.jwk);
      }

      // Add content type
      tx.addTag("Content-Type", contentType);
      logger.info("Added Content-Type tag");

      // Add custom tags
      for (const tag of tags) {
        tx.addTag(tag.name, tag.value);
        logger.info({ tag }, "Added tag");
      }

      // Always add ETS tags for easy identification
      tx.addTag("App-Name", "Ethereum-Tag-Service");
      tx.addTag("App-Version", "1.0.0");

      // Sign the transaction
      logger.info("Signing transaction...");
      await this.arweave.transactions.sign(tx, this.jwk);
      logger.info("Transaction signed successfully");

      // Calculate the cost in AR
      const winston = tx.reward;
      const ar = this.arweave.ar.winstonToAr(winston);
      logger.info({ cost: ar }, "Transaction cost in AR");

      // Submit the transaction
      logger.info("Submitting transaction to Arweave...");
      const response = await this.arweave.transactions.post(tx);

      logger.info(
        {
          response: {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
          },
        },
        "Transaction submission response",
      );

      if (response.status !== 200) {
        throw new Error(`Failed to submit transaction: ${response.statusText}`);
      }

      logger.info({ txId: tx.id }, "Data uploaded to Arweave");
      return tx.id;
    } catch (error) {
      // More detailed error logging with proper object serialization
      logger.error(
        {
          error,
          errorDetails:
            error instanceof Error
              ? {
                  message: error.message,
                  stack: error.stack,
                  name: error.name,
                  // If error contains a response object (like from axios)
                  response: (error as any).response
                    ? {
                        status: (error as any).response.status,
                        statusText: (error as any).response.statusText,
                        data: (error as any).response.data,
                      }
                    : undefined,
                }
              : String(error),
        },
        "Failed to upload data to Arweave",
      );

      throw new Error("Failed to upload data to Arweave");
    }
  }

  /**
   * Upload data to Arweave, verify it's accessible, then return the transaction ID
   */
  public async uploadDataAndVerify(
    data: string | Buffer,
    contentType = "application/json",
    tags: { name: string; value: string }[] = [],
    maxRetries = 5,
    retryDelay = 500,
  ): Promise<string> {
    // First upload the data as before
    const txId = await this.uploadData(data, contentType, tags);

    // Now verify it's accessible via the gateway
    logger.info({ txId }, "Verifying transaction is accessible via gateway");

    let accessible = false;
    let attempts = 0;

    while (!accessible && attempts < maxRetries) {
      attempts++;
      try {
        // Small delay between attempts
        await new Promise((resolve) => setTimeout(resolve, retryDelay));

        // Try to fetch the data from the gateway
        const url = this.getTransactionUrl(txId);
        const response = await axios.get(url, { timeout: 3000 });

        if (response.status === 200) {
          logger.info({ txId, attempts }, "Transaction verified accessible");
          accessible = true;
        }
      } catch (error) {
        logger.info({ txId, attempts, maxRetries }, "Transaction not yet accessible");

        if (attempts === maxRetries) {
          logger.warn({ txId, attempts, maxRetries }, "Could not verify transaction is accessible. Proceeding anyway.");
        }

        logger.error(
          {
            error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
          },
          "Verification error details",
        );
      }
    }

    return txId;
  }

  /**
   * Upload metadata for a target
   * @param targetId The target ID
   * @param metadata The metadata object
   * @returns Transaction ID (hash)
   */
  public async uploadTargetMetadata(targetId: string, metadata: any): Promise<string> {
    // Step 1: Create a draft transaction to estimate cost
    const draftData = JSON.stringify(metadata);
    const draftTx = await this.arweave.createTransaction(
      {
        data: draftData,
      },
      this.jwk,
    );

    // Get the estimated cost
    const estimatedWinston = draftTx.reward;
    const estimatedAr = this.arweave.ar.winstonToAr(estimatedWinston);

    // Step 2: Add the cost to the metadata
    metadata.arweaveTxCost = estimatedAr;
    metadata.arweaveTxCostTimestamp = Date.now();

    // Step 3: Create the actual data with the cost included
    const finalData = JSON.stringify(metadata);
    const tags = [
      { name: "Target-ID", value: targetId },
      { name: "Content-Type", value: "application/json" },
      { name: "Type", value: "target-metadata" },
    ];

    logger.info({ targetId, estimatedArCost: estimatedAr }, "Uploading target metadata with cost to Arweave");
    return this.uploadDataAndVerify(finalData, "application/json", tags);
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

  private async checkArLocalRunning() {
    try {
      logger.info({ gateway: config.arweave.gateway }, "Checking if ArLocal is running");

      // Use the built-in http module to avoid adding axios as a dependency here
      const http = await import("node:http");

      await new Promise((resolve, reject) => {
        const req = http.get(`${config.arweave.gateway}/info`, (res) => {
          if (res.statusCode === 200) {
            resolve(void 0);
          } else {
            reject(new Error(`ArLocal responded with status code ${res.statusCode}`));
          }
          // Consume response data to free up memory
          res.resume();
        });

        req.on("error", (err) => {
          reject(err);
        });

        // Set a timeout of 2 seconds
        req.setTimeout(2000, () => {
          req.destroy();
          reject(new Error("Request timed out"));
        });
      });

      logger.info({ gateway: config.arweave.gateway }, "ArLocal is running and accessible");
    } catch (error: unknown) {
      logger.error(
        {
          gateway: config.arweave.gateway,
          error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
        },
        "⚠️ ArLocal is not running or not accessible!",
      );

      // Log instructions as separate entries for better readability
      logger.error("To fix this, you have three options:");
      logger.error({ solution: 1 }, "Start ArLocal in another terminal with: npx arlocal");
      logger.error({ solution: 2 }, "Set MOCK_ARWEAVE=true in your .env.local to use mock mode");
      logger.error({ solution: 3 }, "Point to a real Arweave gateway by setting ARWEAVE_GATEWAY=https://arweave.net");

      // Falling back to mock mode
      logger.warn("Falling back to MOCK mode for Arweave operations");
      this.isMock = true;
    }
  }
}
export const arweaveService = new ArweaveService();

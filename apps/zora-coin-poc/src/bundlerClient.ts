/**
 * Bundler Client for UserOperation Submission
 *
 * Handles submission of signed UserOperations to ERC-4337 bundlers
 * for actual execution on Base mainnet.
 */

import type { UserOperation } from "./types.js";

export interface BundlerResponse {
  success: boolean;
  userOpHash?: `0x${string}`;
  transactionHash?: `0x${string}`;
  error?: string;
}

export interface BundlerReceipt {
  userOpHash: `0x${string}`;
  transactionHash: `0x${string}`;
  success: boolean;
  actualGasUsed: bigint;
  actualGasCost: bigint;
  logs: any[];
}

export class BundlerClient {
  private readonly bundlerUrl: string;
  private readonly apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
    // Use Alchemy's Base bundler - they have good support for Base mainnet
    this.bundlerUrl = `https://base-mainnet.g.alchemy.com/v2/${apiKey}`;
  }

  /**
   * Submit a signed UserOperation to the bundler
   */
  async submitUserOperation(userOp: UserOperation): Promise<BundlerResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: "Alchemy API key not configured - cannot submit to bundler",
      };
    }

    try {
      console.log("📤 Submitting UserOperation to bundler...");

      // Log the formatted UserOp for debugging
      const formattedUserOp = this.formatUserOpForBundler(userOp);
      console.log("🔍 UserOperation details:");
      console.log(`   Sender: ${formattedUserOp.sender}`);
      console.log(`   Nonce: ${formattedUserOp.nonce}`);
      console.log(`   Call Gas Limit: ${formattedUserOp.callGasLimit}`);
      console.log(`   Verification Gas Limit: ${formattedUserOp.verificationGasLimit}`);
      console.log(`   Pre Verification Gas: ${formattedUserOp.preVerificationGas}`);
      console.log(`   Signature length: ${formattedUserOp.signature.length} chars`);

      const response = await fetch(this.bundlerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_sendUserOperation",
          params: [
            this.formatUserOpForBundler(userOp),
            "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // Entry Point address
          ],
          id: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = (await response.json()) as any;

      if (result.error) {
        return {
          success: false,
          error: `Bundler error: ${result.error.message || result.error}`,
        };
      }

      const userOpHash = result.result as `0x${string}`;
      console.log("✅ UserOperation submitted successfully");
      console.log(`   UserOp Hash: ${userOpHash}`);

      return {
        success: true,
        userOpHash,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown bundler error",
      };
    }
  }

  /**
   * Wait for UserOperation receipt
   */
  async waitForUserOpReceipt(userOpHash: `0x${string}`, timeoutMs = 60000): Promise<BundlerReceipt | null> {
    if (!this.apiKey) {
      console.warn("No API key - cannot wait for receipt");
      return null;
    }

    console.log("⏳ Waiting for UserOperation receipt...");
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const response = await fetch(this.bundlerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getUserOperationReceipt",
            params: [userOpHash],
            id: Date.now(),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = (await response.json()) as any;

        if (result.result) {
          const receipt = result.result;
          console.log("🎯 UserOperation executed!");
          console.log(`   Transaction Hash: ${receipt.transactionHash}`);
          console.log(`   Gas Used: ${BigInt(receipt.actualGasUsed)}`);

          return {
            userOpHash,
            transactionHash: receipt.transactionHash,
            success: receipt.success,
            actualGasUsed: BigInt(receipt.actualGasUsed),
            actualGasCost: BigInt(receipt.actualGasCost),
            logs: receipt.logs,
          };
        }

        // Not ready yet, wait and retry
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.warn("Error checking receipt, retrying...", error);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.warn("⚠️ Timeout waiting for UserOperation receipt");
    return null;
  }

  /**
   * Format UserOperation for bundler submission
   */
  private formatUserOpForBundler(userOp: UserOperation): any {
    return {
      sender: userOp.sender,
      nonce: `0x${userOp.nonce.toString(16)}`,
      initCode: userOp.factory && userOp.factoryData ? userOp.factory + userOp.factoryData.slice(2) : "0x",
      callData: userOp.callData,
      callGasLimit: `0x${userOp.callGasLimit.toString(16)}`,
      verificationGasLimit: `0x${userOp.verificationGasLimit.toString(16)}`,
      preVerificationGas: `0x${userOp.preVerificationGas.toString(16)}`,
      maxFeePerGas: `0x${userOp.maxFeePerGas.toString(16)}`,
      maxPriorityFeePerGas: `0x${userOp.maxPriorityFeePerGas.toString(16)}`,
      paymasterAndData:
        userOp.paymaster && userOp.paymasterData
          ? userOp.paymaster +
            (userOp.paymasterVerificationGasLimit?.toString(16) || "") +
            (userOp.paymasterPostOpGasLimit?.toString(16) || "") +
            (userOp.paymasterData?.slice(2) || "")
          : "0x",
      signature: userOp.signature,
    };
  }

  /**
   * Check if bundler is available
   */
  async checkHealth(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const response = await fetch(this.bundlerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_supportedEntryPoints",
          params: [],
          id: 1,
        }),
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Smart Wallet Client for Zora Content Coin Creation
 *
 * Uses Viem's Account Abstraction support to create UserOperations
 * that can be signed by either the EOA or Privy wallet owners.
 */

import {
  http,
  type Account,
  type PublicClient,
  type WalletClient,
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  hexToBigInt,
  keccak256,
  parseEther,
  toBytes,
  toHex,
} from "viem";
import { toCoinbaseSmartAccount } from "viem/account-abstraction";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { MetadataClient } from "./metadataClient.js";
import type { CoinDeployParams, Config, TagMetadataRequest, UserOperation } from "./types.js";

export class SmartWalletClient {
  private publicClient: PublicClient;
  private config: Config;
  private metadataClient: MetadataClient;

  constructor(config: Config) {
    this.config = config;
    this.publicClient = createPublicClient({
      chain: base,
      transport: http(config.rpcUrl),
    });
    this.metadataClient = new MetadataClient(config.offchainApiUrl);
  }

  /**
   * Create a wallet client from a private key
   */
  private createWalletFromPrivateKey(privateKey: `0x${string}`): WalletClient {
    const account = privateKeyToAccount(privateKey);
    return createWalletClient({
      account,
      chain: base,
      transport: http(this.config.rpcUrl),
    });
  }

  /**
   * Get the current nonce for the smart wallet
   */
  async getNonce(): Promise<bigint> {
    try {
      // Call EntryPoint.getNonce(sender, key)
      const nonce = await this.publicClient.readContract({
        address: this.config.smartWallet.entryPoint,
        abi: [
          {
            inputs: [
              { name: "sender", type: "address" },
              { name: "key", type: "uint192" },
            ],
            name: "getNonce",
            outputs: [{ name: "nonce", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "getNonce",
        args: [this.config.smartWallet.address, 0n],
      });

      console.log(`📊 EntryPoint nonce for ${this.config.smartWallet.address}: ${nonce}`);
      return nonce as bigint;
    } catch (error) {
      console.error("❌ Failed to get nonce from EntryPoint:", error);
      throw new Error(`Cannot get nonce: ${error}`);
    }
  }

  /**
   * Create calldata for Zora Factory deploy function
   */
  createZoraDeployCalldata(params: CoinDeployParams): `0x${string}` {
    return encodeFunctionData({
      abi: [
        {
          inputs: [
            { name: "payoutRecipient", type: "address" },
            { name: "owners", type: "address[]" },
            { name: "uri", type: "string" },
            { name: "name", type: "string" },
            { name: "symbol", type: "string" },
            { name: "poolConfig", type: "bytes" },
            { name: "platformReferrer", type: "address" },
            { name: "postDeployHook", type: "address" },
            { name: "postDeployHookData", type: "bytes" },
            { name: "coinSalt", type: "bytes32" },
          ],
          name: "deploy",
          outputs: [
            { name: "coin", type: "address" },
            { name: "", type: "bytes" },
          ],
          stateMutability: "payable",
          type: "function",
        },
      ],
      functionName: "deploy",
      args: [
        params.payoutRecipient,
        params.owners,
        params.uri,
        params.name,
        params.symbol,
        params.poolConfig,
        params.platformReferrer,
        params.postDeployHook,
        params.postDeployHookData,
        params.coinSalt,
      ],
    });
  }

  /**
   * Create calldata for smart wallet execute function
   */
  createSmartWalletCalldata(target: `0x${string}`, value: bigint, data: `0x${string}`): `0x${string}` {
    // Coinbase Smart Wallet execute function
    return encodeFunctionData({
      abi: [
        {
          inputs: [
            { name: "target", type: "address" },
            { name: "value", type: "uint256" },
            { name: "data", type: "bytes" },
          ],
          name: "execute",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
      ],
      functionName: "execute",
      args: [target, value, data],
    });
  }

  /**
   * Build a UserOperation for coin deployment
   */
  async buildDeployUserOp(params: CoinDeployParams): Promise<Omit<UserOperation, "signature">> {
    const nonce = await this.getNonce();

    // Create the deploy calldata
    const deployCalldata = this.createZoraDeployCalldata(params);

    // Wrap in smart wallet execute call
    const callData = this.createSmartWalletCalldata(
      this.config.zoraFactory,
      0n, // No ETH value needed
      deployCalldata,
    );

    // Get current gas prices
    const gasPrice = await this.publicClient.getGasPrice();

    return {
      sender: this.config.smartWallet.address,
      nonce,
      callData,
      callGasLimit: 2000000n, // Increased for complex Zora deployment
      verificationGasLimit: 500000n,
      preVerificationGas: 50000n,
      maxFeePerGas: gasPrice + parseEther("0.000000002"), // +2 gwei
      maxPriorityFeePerGas: parseEther("0.000000002"), // 2 gwei
      signature: "0x", // Will be filled by signer
    };
  }

  /**
   * Sign UserOperation with EOA using proper Coinbase Smart Account
   */
  async signUserOpWithEOA(userOp: Omit<UserOperation, "signature">): Promise<UserOperation> {
    // Create owner account from private key
    const owner = privateKeyToAccount(`0x${this.config.smartWallet.owners.eoa}` as `0x${string}`);

    // Create Coinbase Smart Account
    const smartAccount = await toCoinbaseSmartAccount({
      client: this.publicClient,
      owners: [owner],
      address: this.config.smartWallet.address,
    });

    // Use the smart account's built-in signing which handles the proper format
    const signature = await smartAccount.signUserOperation(userOp);

    return {
      ...userOp,
      signature: signature.signature,
    };
  }

  /**
   * Sign UserOperation with Privy wallet using proper Coinbase Smart Account
   */
  async signUserOpWithPrivy(userOp: Omit<UserOperation, "signature">): Promise<UserOperation> {
    // Create owner account from private key
    const owner = privateKeyToAccount(`0x${this.config.smartWallet.owners.privy}` as `0x${string}`);

    // Create Coinbase Smart Account
    const smartAccount = await toCoinbaseSmartAccount({
      client: this.publicClient,
      owners: [owner],
      address: this.config.smartWallet.address,
    });

    // Use the smart account's built-in signing which handles the proper format
    const signature = await smartAccount.signUserOperation(userOp);

    return {
      ...userOp,
      signature: signature.signature,
    };
  }

  /**
   * Calculate UserOperation hash for signing
   * This is a simplified version - production should use proper EIP-4337 hash calculation
   */
  private getUserOpHash(userOp: Omit<UserOperation, "signature">): `0x${string}` {
    // Simplified hash calculation for POC
    // In production, this should follow EIP-4337 spec exactly
    const packed = toHex(
      toBytes(userOp.sender) + toBytes(toHex(userOp.nonce, { size: 32 })) + toBytes(userOp.callData),
    );

    return keccak256(toBytes(packed));
  }

  /**
   * Get ETH balance of the smart wallet
   */
  async getBalance(): Promise<bigint> {
    return await this.publicClient.getBalance({
      address: this.config.smartWallet.address,
    });
  }

  /**
   * Check if smart wallet is deployed on-chain
   */
  async isWalletDeployed(): Promise<boolean> {
    try {
      const code = await this.publicClient.getBytecode({
        address: this.config.smartWallet.address,
      });
      return code !== undefined && code !== "0x";
    } catch {
      return false;
    }
  }

  /**
   * Generate metadata using the offchain-api and create coin deployment parameters
   */
  async createCoinParamsWithMetadata(): Promise<CoinDeployParams> {
    // Check if offchain-api is available
    const isApiHealthy = await this.metadataClient.checkHealth();
    if (!isApiHealthy) {
      console.warn("Offchain-api not available, using default metadata");
      return this.createDefaultCoinParams();
    }

    // Create a unique tag for this POC test
    const tagRequest = this.metadataClient.createPOCTagRequest(this.config.smartWallet.address);

    console.log("🎨 Generating metadata for tag:", tagRequest.tagString);

    // Generate metadata via offchain-api
    const metadataResult = await this.metadataClient.generateTagMetadata(tagRequest);

    if (!metadataResult.success || !metadataResult.createMetadataParameters) {
      console.warn("Metadata generation failed, using defaults:", metadataResult.error);
      return this.createDefaultCoinParams();
    }

    console.log("✅ Metadata generated successfully:", metadataResult.metadataUri);

    // Use the generated metadata parameters
    const { name, symbol, uri } = metadataResult.createMetadataParameters;

    return {
      payoutRecipient: this.config.smartWallet.address,
      owners: [this.config.smartWallet.address],
      uri,
      name,
      symbol,
      poolConfig: "0x", // Will need to extract from existing coin
      platformReferrer: this.config.coinDefaults.platformReferrer,
      postDeployHook: "0x0000000000000000000000000000000000000000",
      postDeployHookData: "0x",
      coinSalt: keccak256(toBytes(Date.now().toString())),
    };
  }

  /**
   * Create default coin deployment parameters (fallback)
   */
  createDefaultCoinParams(): CoinDeployParams {
    return {
      payoutRecipient: this.config.smartWallet.address,
      owners: [this.config.smartWallet.address],
      uri: this.config.coinDefaults.uri,
      name: this.config.coinDefaults.name,
      symbol: this.config.coinDefaults.symbol,
      poolConfig: "0x", // Will need to extract from existing coin
      platformReferrer: this.config.coinDefaults.platformReferrer,
      postDeployHook: "0x0000000000000000000000000000000000000000",
      postDeployHookData: "0x",
      coinSalt: keccak256(toBytes(Date.now().toString())),
    };
  }
}

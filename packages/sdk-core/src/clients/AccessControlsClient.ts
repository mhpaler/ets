import { etsAccessControlsConfig } from "@ethereum-tag-service/contracts/contracts";
import type { Hex, PublicClient } from "viem";
import type { AccessControlsReadFunction } from "../types";
import { DEFAULT_ENVIRONMENT, type Environment, getAddressForEnvironment } from "../utils/environment";
import { handleContractRead } from "../utils/handleContractRead";

export class AccessControlsClient {
  private readonly publicClient: PublicClient;
  private readonly address: Hex;
  private readonly abi: any;
  private readonly environment: Environment;

  /**
   * Get the contract address
   * @returns The contract address
   */
  getAddress(): Hex {
    return this.address;
  }

  constructor({
    publicClient,
    chainId,
    environment = DEFAULT_ENVIRONMENT,
  }: {
    publicClient: PublicClient;
    chainId?: number;
    environment?: Environment;
  }) {
    if (!publicClient) {
      throw new Error("[@ethereum-tag-service/sdk-core] Public client is required for AccessControlsClient");
    }

    if (!chainId) {
      throw new Error("[@ethereum-tag-service/sdk-core] Chain ID is required for AccessControlsClient");
    }

    if (publicClient.chain?.id !== chainId) {
      throw new Error(
        `[@ethereum-tag-service/sdk-core] Chain ID mismatch in AccessControlsClient: provided ${chainId}, but public client has ${publicClient.chain?.id}`,
      );
    }

    // Get the contract address for the specified chain and environment
    const contractAddress = getAddressForEnvironment(etsAccessControlsConfig.address, chainId, environment);

    if (!contractAddress) {
      throw new Error(
        `[@ethereum-tag-service/sdk-core] AccessControls contract not configured for chain ${chainId} and environment ${environment}`,
      );
    }

    this.publicClient = publicClient;
    this.address = contractAddress as Hex;
    this.abi = etsAccessControlsConfig.abi;
    this.environment = environment;
  }
  private async readContract(functionName: AccessControlsReadFunction, args: any[] = []): Promise<any> {
    return handleContractRead(this.publicClient, this.address, this.abi, functionName, args);
  }

  async hasRole(role: string, account: string): Promise<boolean> {
    return this.readContract("hasRole", [role, account]);
  }

  async isAdmin(addr: string): Promise<boolean> {
    return this.readContract("isAdmin", [addr]);
  }

  async isAuctionOracle(addr: string): Promise<boolean> {
    return this.readContract("isAuctionOracle", [addr]);
  }

  async isRelayer(addr: string): Promise<boolean> {
    return this.readContract("isRelayer", [addr]);
  }

  async isRelayerAdmin(addr: string): Promise<boolean> {
    return this.readContract("isRelayerAdmin", [addr]);
  }

  async isRelayerAndNotPaused(addr: string): Promise<boolean> {
    return this.readContract("isRelayerAndNotPaused", [addr]);
  }

  async isRelayerByAddress(addr: string): Promise<boolean> {
    return this.readContract("isRelayerByAddress", [addr]);
  }

  async isRelayerByName(name: string): Promise<boolean> {
    return this.readContract("isRelayerByName", [name]);
  }

  async isRelayerByOwner(addr: string): Promise<boolean> {
    return this.readContract("isRelayerByOwner", [addr]);
  }

  async isRelayerFactory(addr: string): Promise<boolean> {
    return this.readContract("isRelayerFactory", [addr]);
  }

  async isRelayerLocked(addr: string): Promise<boolean> {
    return this.readContract("isRelayerLocked", [addr]);
  }

  async isSmartContract(addr: string): Promise<boolean> {
    return this.readContract("isSmartContract", [addr]);
  }

  async getPlatformAddress(): Promise<string> {
    return this.readContract("getPlatformAddress");
  }

  async getRelayerAddressFromName(name: string): Promise<string> {
    return this.readContract("getRelayerAddressFromName", [name]);
  }

  async getRelayerAddressFromOwner(address: string): Promise<string> {
    return this.readContract("getRelayerAddressFromOwner", [address]);
  }

  async getRelayerNameFromAddress(address: string): Promise<string> {
    return this.readContract("getRelayerNameFromAddress", [address]);
  }

  async getRoleAdmin(role: string): Promise<string> {
    return this.readContract("getRoleAdmin", [role]);
  }

  async relayerContractToName(address: string): Promise<string> {
    return this.readContract("relayerContractToName", [address]);
  }

  async relayerLocked(address: string): Promise<boolean> {
    return this.readContract("relayerLocked", [address]);
  }

  async relayerNameToContract(name: string): Promise<string> {
    return this.readContract("relayerNameToContract", [name]);
  }

  async relayerOwnerToAddress(address: string): Promise<string> {
    return this.readContract("relayerOwnerToAddress", [address]);
  }

  async supportsInterface(interfaceId: string): Promise<boolean> {
    return this.readContract("supportsInterface", [interfaceId]);
  }
}

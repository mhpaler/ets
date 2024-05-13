import { PublicClient } from "viem";
import { etsAccessControlsConfig } from "../../contracts/contracts";
import { handleContractRead } from "../utils";
import { AccessControlsReadFunction } from "../types";

export class AccessControlsClient {
  private readonly chainId?: number;
  private readonly publicClient: PublicClient;

  constructor({ publicClient, chainId }: { publicClient: PublicClient; chainId?: number }) {
    this.publicClient = publicClient;
    this.chainId = chainId;

    if (publicClient === undefined) {
      throw new Error("Public client is required");
    }

    if (chainId !== undefined && publicClient.chain?.id !== chainId) {
      throw new Error("Provided chain id should match the public client chain id");
    }
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

  private async readContract(functionName: AccessControlsReadFunction, args: any[] = []): Promise<any> {
    return handleContractRead(
      this.publicClient,
      etsAccessControlsConfig.address,
      etsAccessControlsConfig.abi,
      functionName,
      args,
    );
  }
}

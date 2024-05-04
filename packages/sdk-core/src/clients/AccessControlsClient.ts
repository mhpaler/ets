import { PublicClient, WalletClient } from "viem";
import { etsAccessControlsConfig } from "../../contracts/contracts";
import { manageContractRead, manageContractCall } from "../utils";
import { AccessControlsRead, AccessControlsWrite } from "../types";

export class AccessControlsClient {
  private readonly publicClient: PublicClient;
  private readonly walletClient: WalletClient | undefined;

  constructor({ publicClient, walletClient }: { publicClient: PublicClient; walletClient?: WalletClient }) {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
  }

  async grantRole(role: string, account: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("grantRole", [role, account]);
  }

  async revokeRole(role: string, account: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("revokeRole", [role, account]);
  }

  async changeRelayerOwner(
    currentOwner: string,
    newOwner: string,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("changeRelayerOwner", [currentOwner, newOwner]);
  }

  async initialize(platformAddress: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("initialize", [platformAddress]);
  }

  async renounceRole(role: string, account: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("renounceRole", [role, account]);
  }

  async pauseRelayerByOwnerAddress(relayerOwner: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("pauseRelayerByOwnerAddress", [relayerOwner]);
  }

  async registerRelayer(
    relayer: string,
    name: string,
    owner: string,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("registerRelayer", [relayer, name, owner]);
  }

  async setPlatform(platform: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setPlatform", [platform]);
  }

  async setRoleAdmin(role: string, adminRole: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("setRoleAdmin", [role, adminRole]);
  }

  async toggleRelayerLock(relayer: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("toggleRelayerLock", [relayer]);
  }

  async upgradeTo(newImplementation: string): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("upgradeTo", [newImplementation]);
  }

  async upgradeToAndCall(
    newImplementation: string,
    data: string,
  ): Promise<{ transactionHash: string; status: number }> {
    return this.callContract("upgradeToAndCall", [newImplementation, data]);
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

  async proxiableUUID(): Promise<string> {
    return this.readContract("proxiableUUID");
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

  private async readContract(functionName: AccessControlsRead, args: any[] = []): Promise<any> {
    return manageContractRead(
      this.publicClient,
      etsAccessControlsConfig.address,
      etsAccessControlsConfig.abi,
      functionName,
      args,
    );
  }

  private async callContract(
    functionName: AccessControlsWrite,
    args: any[] = [],
  ): Promise<{ transactionHash: string; status: number }> {
    if (!this.walletClient) {
      throw new Error("Wallet client is required to perform this action");
    }
    return manageContractCall(
      this.publicClient,
      this.walletClient,
      etsAccessControlsConfig.address,
      etsAccessControlsConfig.abi,
      functionName,
      args,
    );
  }
}

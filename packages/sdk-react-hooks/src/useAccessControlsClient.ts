import {
  type AccessControlsClient,
  DEFAULT_ENVIRONMENT,
  type Environment,
  createAccessControlsClient,
} from "@ethereum-tag-service/sdk-core";
import { useContext, useEffect, useState } from "react";

export const useAccessControlsClient = ({
  chainId,
  account,
  environment = DEFAULT_ENVIRONMENT,
}: {
  chainId?: number;
  account?: `0x${string}`;
  environment?: Environment;
}) => {
  const [accessControlsClient, setAccessControlsClient] = useState<AccessControlsClient>();

  useEffect(() => {
    if (!chainId || !account) return;

    const client = createAccessControlsClient({ chainId, account, environment });
    setAccessControlsClient(client);
  }, [chainId, account, environment]);

  const hasRole = async (role: string, account: string): Promise<boolean> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.hasRole(role, account);
  };

  const isAdmin = async (addr: string): Promise<boolean> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.isAdmin(addr);
  };

  const isAuctionOracle = async (addr: string): Promise<boolean> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.isAuctionOracle(addr);
  };

  const isRelayer = async (addr: string): Promise<boolean> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.isRelayer(addr);
  };

  const isRelayerAdmin = async (addr: string): Promise<boolean> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.isRelayerAdmin(addr);
  };

  const isRelayerAndNotPaused = async (addr: string): Promise<boolean> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.isRelayerAndNotPaused(addr);
  };

  const isSmartContract = async (addr: string): Promise<boolean> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.isSmartContract(addr);
  };

  const supportsInterface = async (interfaceId: string): Promise<boolean> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.supportsInterface(interfaceId);
  };

  const getPlatformAddress = async (): Promise<string> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.getPlatformAddress();
  };

  const getRelayerAddressFromName = async (name: string): Promise<string> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.getRelayerAddressFromName(name);
  };

  const getRelayerAddressFromOwner = async (address: string): Promise<string> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.getRelayerAddressFromOwner(address);
  };

  const getRelayerNameFromAddress = async (address: string): Promise<string> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.getRelayerNameFromAddress(address);
  };

  const getRoleAdmin = async (role: string): Promise<string> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.getRoleAdmin(role);
  };

  const relayerContractToName = async (address: string): Promise<string> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.relayerContractToName(address);
  };

  const relayerLocked = async (address: string): Promise<boolean> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.relayerLocked(address);
  };

  const relayerNameToContract = async (name: string): Promise<string> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.relayerNameToContract(name);
  };

  const relayerOwnerToAddress = async (address: string): Promise<string> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.relayerOwnerToAddress(address);
  };

  const isRelayerByAddress = async (addr: string): Promise<boolean> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.isRelayerByAddress(addr);
  };

  const isRelayerByName = async (name: string): Promise<boolean> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.isRelayerByName(name);
  };

  const isRelayerByOwner = async (addr: string): Promise<boolean> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.isRelayerByOwner(addr);
  };

  const isRelayerFactory = async (addr: string): Promise<boolean> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.isRelayerFactory(addr);
  };

  const isRelayerLocked = async (addr: string): Promise<boolean> => {
    if (!accessControlsClient) throw new Error("Access Controls client not initialized");
    return await accessControlsClient.isRelayerLocked(addr);
  };

  return {
    accessControlsClient,
    hasRole,
    isAdmin,
    isAuctionOracle,
    isRelayer,
    isRelayerAdmin,
    isRelayerAndNotPaused,
    isSmartContract,
    supportsInterface,
    getPlatformAddress,
    getRelayerAddressFromName,
    getRelayerAddressFromOwner,
    getRelayerNameFromAddress,
    getRoleAdmin,
    relayerContractToName,
    relayerLocked,
    relayerNameToContract,
    relayerOwnerToAddress,
    isRelayerByAddress,
    isRelayerByName,
    isRelayerByOwner,
    isRelayerFactory,
    isRelayerLocked,
  };
};

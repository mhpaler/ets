import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { createCoreClient } from "@app/services/sdk";
import { CoreClient } from "@ethereum-tag-service/sdk-core";

export const useAccessControlsClient = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const [accessControlsClient, setAccessControlsClient] = useState<CoreClient>();

  useEffect(() => {
    if (!chainId || !address) return;
    const client = createCoreClient({ chainId, account: address, clients: { accessControlsClient: true } });
    setAccessControlsClient(client);
  }, [chainId, address]);

  const hasRole = async (role: string, account: string): Promise<boolean> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.hasRole(role, account);
    } catch (error) {
      throw error;
    }
  };

  const isAdmin = async (addr: string): Promise<boolean> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.isAdmin(addr);
    } catch (error) {
      throw error;
    }
  };

  const isAuctionOracle = async (addr: string): Promise<boolean> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.isAuctionOracle(addr);
    } catch (error) {
      throw error;
    }
  };

  const isRelayer = async (addr: string): Promise<boolean> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.isRelayer(addr);
    } catch (error) {
      throw error;
    }
  };

  const isRelayerAdmin = async (addr: string): Promise<boolean> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.isRelayerAdmin(addr);
    } catch (error) {
      throw error;
    }
  };

  const isRelayerAndNotPaused = async (addr: string): Promise<boolean> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.isRelayerAndNotPaused(addr);
    } catch (error) {
      throw error;
    }
  };

  const isSmartContract = async (addr: string): Promise<boolean> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.isSmartContract(addr);
    } catch (error) {
      throw error;
    }
  };

  const supportsInterface = async (interfaceId: string): Promise<boolean> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.supportsInterface(interfaceId);
    } catch (error) {
      throw error;
    }
  };

  const getPlatformAddress = async (): Promise<string> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.getPlatformAddress();
    } catch (error) {
      throw error;
    }
  };

  const getRelayerAddressFromName = async (name: string): Promise<string> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.getRelayerAddressFromName(name);
    } catch (error) {
      throw error;
    }
  };

  const getRelayerAddressFromOwner = async (address: string): Promise<string> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.getRelayerAddressFromOwner(address);
    } catch (error) {
      throw error;
    }
  };

  const getRelayerNameFromAddress = async (address: string): Promise<string> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.getRelayerNameFromAddress(address);
    } catch (error) {
      throw error;
    }
  };

  const getRoleAdmin = async (role: string): Promise<string> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.getRoleAdmin(role);
    } catch (error) {
      throw error;
    }
  };

  const relayerContractToName = async (address: string): Promise<string> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.relayerContractToName(address);
    } catch (error) {
      throw error;
    }
  };

  const relayerLocked = async (address: string): Promise<boolean> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.relayerLocked(address);
    } catch (error) {
      throw error;
    }
  };

  const relayerNameToContract = async (name: string): Promise<string> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.relayerNameToContract(name);
    } catch (error) {
      throw error;
    }
  };

  const relayerOwnerToAddress = async (address: string): Promise<string> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.relayerOwnerToAddress(address);
    } catch (error) {
      throw error;
    }
  };

  const isRelayerByAddress = async (addr: string): Promise<boolean> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.isRelayerByAddress(addr);
    } catch (error) {
      throw error;
    }
  };

  const isRelayerByName = async (name: string): Promise<boolean> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.isRelayerByName(name);
    } catch (error) {
      throw error;
    }
  };

  const isRelayerByOwner = async (addr: string): Promise<boolean> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.isRelayerByOwner(addr);
    } catch (error) {
      throw error;
    }
  };

  const isRelayerFactory = async (addr: string): Promise<boolean> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.isRelayerFactory(addr);
    } catch (error) {
      throw error;
    }
  };

  const isRelayerLocked = async (addr: string): Promise<boolean> => {
    try {
      if (!accessControlsClient) throw new Error("Access Controls client not initialized");
      return await accessControlsClient.isRelayerLocked(addr);
    } catch (error) {
      throw error;
    }
  };

  return {
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

import { getContractAddresses as getDeployedAddresses } from "@ethereum-tag-service/contracts/deployments";
import type { Address } from "viem";
import { type Chain, base, baseSepolia, localhost } from "viem/chains";

export interface NetworkConfig {
  chainId: number;
  name: string;
  viemChain: Chain;
  rpcUrl: string;
  deploymentBlock?: bigint;
  contracts?: {
    accessControls?: Address;
    token?: Address;
    target?: Address;
    core?: Address;
    enrichTarget?: Address;
    channelFactory?: Address;
  };
}

// Helper to construct Alchemy URL
const getAlchemyUrl = (network: string): string | undefined => {
  const alchemyKey = process.env.ALCHEMY_API_KEY;
  if (!alchemyKey) return undefined;

  const networkMap: Record<string, string> = {
    baseSepolia: "base-sepolia",
    base: "base-mainnet",
  };

  const alchemyNetwork = networkMap[network];
  return alchemyNetwork ? `https://${alchemyNetwork}.g.alchemy.com/v2/${alchemyKey}` : undefined;
};

const networks: Record<string, NetworkConfig> = {
  localhost: {
    chainId: 31337,
    name: "Localhost",
    viemChain: { ...localhost, id: 31337 },
    rpcUrl: process.env.RPC_URL_LOCALHOST || "http://127.0.0.1:8545",
    deploymentBlock: 0n,
  },
  baseSepolia: {
    chainId: 84532,
    name: "Base Sepolia",
    viemChain: baseSepolia,
    rpcUrl: process.env.RPC_URL_BASESEPOLIA || getAlchemyUrl("baseSepolia") || "https://sepolia.base.org",
    deploymentBlock: 31787829n, // ETS deployment block
  },
  base: {
    chainId: 8453,
    name: "Base",
    viemChain: base,
    rpcUrl: process.env.RPC_URL_BASE || getAlchemyUrl("base") || "https://mainnet.base.org",
  },
};

export async function getNetwork(networkName: string): Promise<NetworkConfig> {
  const network = networks[networkName];
  if (!network) {
    throw new Error(`Unknown network: ${networkName}. Supported: ${Object.keys(networks).join(", ")}`);
  }

  // Load contract addresses from deployment
  try {
    // Try to load from new deployments export
    const addresses = getDeployedAddresses(networkName);
    if (addresses) {
      network.contracts = addresses as NetworkConfig["contracts"];
    } else {
      // Try to load from chainConfig (legacy)
      try {
        const chainConfig = await import(`@ethereum-tag-service/contracts/chainConfig/${network.chainId}.json`);
        network.contracts = {
          accessControls: chainConfig.contracts?.ETSAccessControls?.address,
          token: chainConfig.contracts?.ETSToken?.address,
          target: chainConfig.contracts?.ETSTarget?.address,
          core: chainConfig.contracts?.ETS?.address,
          enrichTarget: chainConfig.contracts?.ETSEnrichTarget?.address,
          channelFactory: chainConfig.contracts?.ETSChannelFactory?.address,
        };
      } catch {
        // No contracts found for this network
        if (process.env.DEBUG === "true") {
          console.log(`No contract addresses found for ${networkName}`);
        }
      }
    }
  } catch (error) {
    // No contracts found for this network
    if (process.env.DEBUG === "true") {
      console.log(`Error loading contracts for ${networkName}:`, error);
    }
  }

  return network;
}

export async function getContractAddress(
  network: string,
  contractName: keyof NonNullable<NetworkConfig["contracts"]>,
): Promise<Address> {
  const config = await getNetwork(network);
  const address = config.contracts?.[contractName];

  if (!address) {
    throw new Error(`Contract ${contractName} not deployed on ${network}`);
  }

  return address;
}

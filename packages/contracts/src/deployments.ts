// Auto-generated from Ignition deployments
// Generated at: 2025-09-29T21:30:17.659Z

export interface ContractAddresses {
  accessControls?: string;
  token?: string;
  target?: string;
  core?: string;
  enrichTarget?: string;
  channelFactory?: string;
  mockZoraFactory?: string;
}

export interface NetworkDeployment {
  chainId: number;
  name: string;
  contracts: ContractAddresses;
}

export const deployments: Record<string, NetworkDeployment> = {
  localhost: {
    chainId: 31337,
    name: "localhost",
    contracts: {
      accessControls: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      mockZoraFactory: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
      token: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
      target: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
      core: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
      channelFactory: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
    },
  },
};

export function getDeployment(networkName: string): NetworkDeployment | undefined {
  return deployments[networkName];
}

export function getContractAddress(networkName: string, contractName: keyof ContractAddresses): string | undefined {
  const deployment = deployments[networkName];
  return deployment?.contracts[contractName];
}

export function getContractAddresses(networkName: string): ContractAddresses | undefined {
  return deployments[networkName]?.contracts;
}

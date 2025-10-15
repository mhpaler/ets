// Auto-generated from Ignition deployments
// Generated at: 2025-10-15T01:12:56.767Z

export interface ContractAddresses {
  accessControls?: string;
  mockZoraFactory?: string;
  token?: string;
  target?: string;
  core?: string;
  enrichTarget?: string;
  channelFactory?: string;
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
      enrichTarget: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
    },
  },
  baseSepolia: {
    chainId: 84532,
    name: "baseSepolia",
    contracts: {
      accessControls: "0xacC466E149A0CDb4B620D84756d989Ef8eC9fd85",
      mockZoraFactory: "0x3342B25fAFC05b485D5884b80De2CfcBb0DAd5d4",
      token: "0xF837cb08313ba1F28232b1496aE0F2be3506D8EC",
      target: "0x2Cc8671601743536478E13D482eD34aFA888a9aE",
      core: "0x860C48a21EE3f132CB40c97b48C63DbCA9ec6c3a",
      channelFactory: "0x4fD85d2FD219B110922345E02ACd0a0b7743803f",
      enrichTarget: "0x2Cc8671601743536478E13D482eD34aFA888a9aE",
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

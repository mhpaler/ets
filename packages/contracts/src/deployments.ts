// Auto-generated from Ignition deployments
// Generated at: 2025-10-04T16:48:26.939Z

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
      accessControls: "0x2e1C43375F5533eF69f0D3eD66D3FBf70B607141",
      mockZoraFactory: "0x1409567aABDeB09D0ee9B7B0eB0F10038B5a6f93",
      token: "0xDB1Be3FC9BbD6697920A91AF43df1b7ec898AA86",
      target: "0xEE0DB62a1Fde98da844A6603c71f01a854BC8523",
      core: "0xe7f89C005241C86BeC6c7804C9927a14eaFc6cA0",
      channelFactory: "0x23a20DF2666c0255C5839316004B36c5df1e4101",
      enrichTarget: "0xEE0DB62a1Fde98da844A6603c71f01a854BC8523",
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

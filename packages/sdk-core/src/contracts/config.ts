import type { Hex } from "viem";
import {
  etsABI,
  etsAccessControlsABI,
  etsAuctionHouseABI,
  etsEnrichTargetABI,
  etsRelayerFactoryABI,
  etsRelayerV1ABI,
  etsTargetABI,
  etsTokenABI,
} from "./contracts";

export function getConfig(
  chainId: number | undefined,
  relayerAddress?: Hex,
): { [key: string]: { address: Hex; abi: any } } | undefined {
  switch (chainId) {
    case 421614:
      return {
        etsConfig: {
          address: "0x4763975ee6675C50381e7044524C2a25D5fD5774",
          abi: etsABI,
        },
        etsAccessControlsConfig: {
          address: "0x945f8d0534E6e774Db73A3843568B8c5be2167C0",
          abi: etsAccessControlsABI,
        },
        etsAuctionHouseConfig: {
          address: "0x79A3098b1cc02b5FB675Ce7A97f51d8DdDEeA450",
          abi: etsAuctionHouseABI,
        },
        etsEnrichTargetConfig: {
          address: "0xA6714AFEa909B7e04F9E9f67612373DaB99C6D19",
          abi: etsEnrichTargetABI,
        },
        etsRelayerFactoryConfig: {
          address: "0x10e47F2565CA8dC003e29bc6467688206788caC9",
          abi: etsRelayerFactoryABI,
        },
        etsRelayerV1Config: {
          address: relayerAddress as Hex,
          abi: etsRelayerV1ABI,
        },
        etsTargetConfig: {
          address: "0x907fF76D79e9744c203D4580C07B7b61304CA8a7",
          abi: etsTargetABI,
        },
        etsTokenConfig: {
          address: "0x428fcc3Ac338d8a691eAD046DC9B83B042AEF636",
          abi: etsTokenABI,
        },
      };
    default:
      undefined;
  }
}

// contractConfig.ts
import config from "./abi/config.json";
import ETSTokenABI from "./abi/contracts/ETSToken.sol/ETSToken.json";
import ETSRelayerFactoryABI from "./abi/contracts/ETSRelayerFactory.sol/ETSRelayerFactory.json";
import ETSAuctionABI from "./abi/contracts/ETSAuctionHouse.sol/ETSAuctionHouse.json";

export const etsTokenContractConfig = {
  address: config[31337].contracts.ETSToken.address as `0x${string}`,
  abi: ETSTokenABI,
} as const;

export const etsRelayerFactoryContractConfig = {
  address: config[31337].contracts.ETSRelayerFactory.address as `0x${string}`,
  abi: ETSRelayerFactoryABI,
} as const;

export const etsAuctionHouseContractConfig = {
  address: config[31337].contracts.ETSAuctionHouse.address as `0x${string}`,
  abi: ETSAuctionABI,
} as const;

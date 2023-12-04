// services/auctionHouseServices.ts
import { readContract } from "wagmi/actions";
import { Auction } from "@app/context/AuctionHouseContext";

import { etsAuctionHouseContractConfig as auctionConfig } from "../contract.config";

import ETSAuctionABI from "../abi/contracts/ETSAuctionHouse.sol/ETSAuctionHouse.json";

const abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
    ],
    name: "getAuction",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "auctionId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "startTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "reservePrice",
            type: "uint256",
          },
          {
            internalType: "address payable",
            name: "bidder",
            type: "address",
          },
          {
            internalType: "address payable",
            name: "auctioneer",
            type: "address",
          },
          {
            internalType: "bool",
            name: "settled",
            type: "bool",
          },
        ],
        internalType: "struct IETSAuctionHouse.Auction",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const fetchMaxAuctions = async (): Promise<number> => {
  const data = await readContract({
    ...auctionConfig,
    functionName: "maxAuctions",
  });
  return Number(data);
};

export const fetchCurrentAuctionId = async (): Promise<number> => {
  const data = await readContract({
    ...auctionConfig,
    functionName: "getTotalCount",
  });
  return Number(data);
};

export const fetchAuction = async (auctionId: number): Promise<Auction> => {
  const data = await readContract({
    address: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
    abi: abi,
    functionName: "getAuction",
    args: [BigInt(1)],
  });

  console.log("fetchAuction", data);

  const dummyAuction: Auction = {
    auctionId: 1,
    amount: BigInt(1000000000), // Adjust the BigInt value as needed
    startTime: Date.now() / 1000, // Current timestamp in seconds
    endTime: Date.now() / 1000 + 3600, // One hour from now
    reservePrice: BigInt(500000000), // Adjust the BigInt value as needed
    bidder: "0x1234567890123456789012345678901234567890", // Ethereum address
    settled: false,
    extended: true,
  };

  return dummyAuction;
};

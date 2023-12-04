// context/AuctionHouseContext.ts

import React, {
  createContext,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";

import { useAccount, useContractRead } from "wagmi";

import {
  fetchMaxAuctions,
  fetchCurrentAuctionId,
  fetchAuction,
} from "../services/auctionHouseService";

export type Auction = {
  // Define your auction data structure here
  auctionId: number;
  amount: bigint;
  startTime: number;
  endTime: number;
  reservePrice: bigint;
  bidder: string;
  settled: boolean;
  extended: boolean;
};

export type AuctionHouse = {
  auctionPaused: boolean;
  maxAuctions: number | null;
  currentAuctionId: number | null;
  currentAuction: Auction | null;
  onDisplayAuctionId: number | null;
  setOnDisplayAuctionId: Dispatch<SetStateAction<number | null>>;
  //placeBid: (bidAmount: number) => Promise<void>;
};
//interface AuctionHouse extends AuctionHouse {
//  placeBid: (bidAmount: number) => Promise<void>;
//}

export const AuctionHouseContext = createContext<AuctionHouse | undefined>(
  undefined
);

export const AuctionHouseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  //const { startTransaction, endTransaction } = useTransaction();
  const [auctionPaused, setAuctionPaused] = useState(true);
  const [currentAuctionId, setCurrentAuctionId] = useState<number>(0);
  const [currentAuction, setCurrentAuction] = useState<Auction | null>(null); // Specify the type explicitly
  const [maxAuctions, setMaxAuctions] = useState<number | null>(null); // Specify the type explicitly
  const [onDisplayAuctionId, setOnDisplayAuctionId] = useState<number | null>(
    null
  );

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
  // Get current user balance of CTAGs
  //  const {} = useContractRead({
  //    address: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
  //    abi: abi,
  //    functionName: "getAuction",
  //    args: [BigInt(1)],
  //    onSuccess(data) {
  //      console.log("balanceOf: ", data);
  //    },
  //  });

  const placeBid = async (bidAmount: number): Promise<void> => {};

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const maxAuctionsData = await fetchMaxAuctions();
        setMaxAuctions(maxAuctionsData);

        const currentAuctionIdData = await fetchCurrentAuctionId();
        console.log("before", currentAuctionId);
        setCurrentAuctionId(currentAuctionIdData);
        console.log("after", currentAuctionId);

        //const currentAuction = await fetchAuction(currentAuctionId);
        //console.log("currentAuction", currentAuction);
        //setCurrentAuction(currentAuction);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [currentAuctionId]);

  const contextValue: AuctionHouse = {
    auctionPaused,
    maxAuctions,
    currentAuctionId,
    onDisplayAuctionId,
    currentAuction,
    setOnDisplayAuctionId,
  };

  return (
    <AuctionHouseContext.Provider value={contextValue}>
      {children}
    </AuctionHouseContext.Provider>
  );
};

import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { createAuctionHouseClient } from "@app/services/sdk";
import { AuctionHouseClient } from "@ethereum-tag-service/sdk-core";

export const useAuctionHouseClient = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const [auctionHouseClient, setAuctionHouseClient] = useState<AuctionHouseClient>();

  useEffect(() => {
    if (!chainId || !address) return;
    const client = createAuctionHouseClient({ chainId, account: address });
    setAuctionHouseClient(client);
  }, [chainId, address]);

  const createBid = async (auctionId: bigint) => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return auctionHouseClient.createBid(auctionId);
  };

  const createNextAuction = async () => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return auctionHouseClient.createNextAuction();
  };

  const settleAuction = async (auctionId: bigint) => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return auctionHouseClient.settleAuction(auctionId);
  };

  return {
    createBid,
    createNextAuction,
    settleAuction,
  };
};

import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { createAuctionHouseClient } from "@ethereum-tag-service/sdk-core";
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

  const createBid = async (auctionId: bigint, value?: bigint) => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.createBid(auctionId, value);
    } catch (error) {
      throw error;
    }
  };

  const createNextAuction = async () => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.createNextAuction();
    } catch (error) {
      throw error;
    }
  };

  const settleAuction = async (auctionId: bigint) => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.settleAuction(auctionId);
    } catch (error) {
      throw error;
    }
  };

  const drawDown = async (account: string) => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.drawDown(account);
    } catch (error) {
      throw error;
    }
  };

  const settleCurrentAndCreateNewAuction = async (auctionId: bigint) => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.settleCurrentAndCreateNewAuction(auctionId);
    } catch (error) {
      throw error;
    }
  };

  const getAuction = async (auctionId: bigint) => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.getAuction(auctionId);
    } catch (error) {
      throw error;
    }
  };

  const auctionExists = async (auctionId: bigint) => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.auctionExists(auctionId);
    } catch (error) {
      throw error;
    }
  };

  const getActiveCount = async () => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.getActiveCount();
    } catch (error) {
      throw error;
    }
  };

  const getAuctionCountForTokenId = async (tokenId: bigint) => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.getAuctionCountForTokenId(tokenId);
    } catch (error) {
      throw error;
    }
  };

  const getAuctionForTokenId = async (tokenId: bigint) => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.getAuctionForTokenId(tokenId);
    } catch (error) {
      throw error;
    }
  };

  const getBalance = async () => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.getBalance();
    } catch (error) {
      throw error;
    }
  };

  const getTotalCount = async () => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.getTotalCount();
    } catch (error) {
      throw error;
    }
  };

  const paused = async () => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.paused();
    } catch (error) {
      throw error;
    }
  };

  const accrued = async (address: string) => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.accrued(address);
    } catch (error) {
      throw error;
    }
  };

  const auctionEnded = async (auctionId: bigint) => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.auctionEnded(auctionId);
    } catch (error) {
      throw error;
    }
  };

  const auctionExistsForTokenId = async (tokenId: bigint) => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.auctionExistsForTokenId(tokenId);
    } catch (error) {
      throw error;
    }
  };

  const auctionSettled = async (auctionId: bigint) => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.auctionSettled(auctionId);
    } catch (error) {
      throw error;
    }
  };

  const auctions = async (index: bigint) => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.auctions(index);
    } catch (error) {
      throw error;
    }
  };

  const auctionsByTokenId = async (tokenId: bigint, index: bigint) => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.auctionsByTokenId(tokenId, index);
    } catch (error) {
      throw error;
    }
  };

  const creatorPercentage = async () => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.creatorPercentage();
    } catch (error) {
      throw error;
    }
  };

  const duration = async () => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.duration();
    } catch (error) {
      throw error;
    }
  };

  const etsAccessControls = async () => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.etsAccessControls();
    } catch (error) {
      throw error;
    }
  };

  const etsToken = async () => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.etsToken();
    } catch (error) {
      throw error;
    }
  };

  const maxAuctions = async () => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.maxAuctions();
    } catch (error) {
      throw error;
    }
  };

  const minBidIncrementPercentage = async () => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.minBidIncrementPercentage();
    } catch (error) {
      throw error;
    }
  };

  const paid = async (address: string) => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.paid(address);
    } catch (error) {
      throw error;
    }
  };

  const platformPercentage = async () => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.platformPercentage();
    } catch (error) {
      throw error;
    }
  };

  const relayerPercentage = async () => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.relayerPercentage();
    } catch (error) {
      throw error;
    }
  };

  const reservePrice = async () => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.reservePrice();
    } catch (error) {
      throw error;
    }
  };

  const timeBuffer = async () => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.timeBuffer();
    } catch (error) {
      throw error;
    }
  };

  const totalDue = async (address: string) => {
    try {
      if (!auctionHouseClient) throw new Error("Auction House client not initialized");
      return await auctionHouseClient.totalDue(address);
    } catch (error) {
      throw error;
    }
  };

  return {
    createBid,
    createNextAuction,
    settleAuction,
    drawDown,
    settleCurrentAndCreateNewAuction,
    getAuction,
    auctionExists,
    getActiveCount,
    getAuctionCountForTokenId,
    getAuctionForTokenId,
    getBalance,
    getTotalCount,
    paused,
    accrued,
    auctionEnded,
    auctionExistsForTokenId,
    auctionSettled,
    auctions,
    auctionsByTokenId,
    creatorPercentage,
    duration,
    etsAccessControls,
    etsToken,
    maxAuctions,
    minBidIncrementPercentage,
    paid,
    platformPercentage,
    relayerPercentage,
    reservePrice,
    timeBuffer,
    totalDue,
  };
};

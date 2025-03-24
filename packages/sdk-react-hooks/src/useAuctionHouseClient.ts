import {
  type AuctionHouseClient,
  DEFAULT_ENVIRONMENT,
  type Environment,
  createAuctionHouseClient,
} from "@ethereum-tag-service/sdk-core";
import { useEffect, useState } from "react";

export const useAuctionHouseClient = ({
  chainId,
  account,
  environment = DEFAULT_ENVIRONMENT,
}: {
  chainId?: number;
  account?: `0x${string}`;
  environment?: Environment;
}) => {
  const [auctionHouseClient, setAuctionHouseClient] = useState<AuctionHouseClient>();

  useEffect(() => {
    if (!chainId || !account) return;
    const client = createAuctionHouseClient({ chainId, account: account, environment });
    setAuctionHouseClient(client);
  }, [chainId, account, environment]);

  const createBid = async (auctionId: bigint, value?: bigint) => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.createBid(auctionId, value);
  };

  const createNextAuction = async () => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.createNextAuction();
  };

  const settleAuction = async (auctionId: bigint) => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.settleAuction(auctionId);
  };

  const drawDown = async (account: string) => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.drawDown(account);
  };

  const settleCurrentAndCreateNewAuction = async (auctionId: bigint) => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.settleCurrentAndCreateNewAuction(auctionId);
  };

  const getAuction = async (auctionId: bigint) => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.getAuction(auctionId);
  };

  const auctionExists = async (auctionId: bigint) => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.auctionExists(auctionId);
  };

  const getActiveCount = async () => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.getActiveCount();
  };

  const getAuctionCountForTokenId = async (tokenId: bigint) => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.getAuctionCountForTokenId(tokenId);
  };

  const getAuctionForTokenId = async (tokenId: bigint) => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.getAuctionForTokenId(tokenId);
  };

  const getBalance = async () => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.getBalance();
  };

  const getTotalCount = async () => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.getTotalCount();
  };

  const paused = async () => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.paused();
  };

  const accrued = async (address: string) => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.accrued(address);
  };

  const auctionEnded = async (auctionId: bigint) => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.auctionEnded(auctionId);
  };

  const auctionExistsForTokenId = async (tokenId: bigint) => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.auctionExistsForTokenId(tokenId);
  };

  const auctionSettled = async (auctionId: bigint) => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.auctionSettled(auctionId);
  };

  const auctions = async (index: bigint) => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.auctions(index);
  };

  const auctionsByTokenId = async (tokenId: bigint, index: bigint) => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.auctionsByTokenId(tokenId, index);
  };

  const creatorPercentage = async () => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.creatorPercentage();
  };

  const duration = async () => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.duration();
  };

  const etsAccessControls = async () => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.etsAccessControls();
  };

  const etsToken = async () => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.etsToken();
  };

  const maxAuctions = async () => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.maxAuctions();
  };

  const minBidIncrementPercentage = async () => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.minBidIncrementPercentage();
  };

  const paid = async (address: string) => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.paid(address);
  };

  const platformPercentage = async () => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.platformPercentage();
  };

  const relayerPercentage = async () => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.relayerPercentage();
  };

  const reservePrice = async () => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.reservePrice();
  };

  const timeBuffer = async () => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.timeBuffer();
  };

  const totalDue = async (address: string) => {
    if (!auctionHouseClient) throw new Error("Auction House client not initialized");
    return await auctionHouseClient.totalDue(address);
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

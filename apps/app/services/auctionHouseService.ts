import { wagmiConfig } from "@app/config/wagmiConfig";
import { useEnvironmentContext } from "@app/context/EnvironmentContext";
import type { Auction, AuctionOnChain, AuctionSettings } from "@app/types/auction";
import { formatEtherWithDecimals } from "@app/utils";
import { fetcher } from "@app/utils/fetchers";
import { getChainInfo } from "@app/utils/getChainInfo";
import { etsAuctionHouseConfig } from "@ethereum-tag-service/contracts/contracts";
import { useCallback, useMemo } from "react";
import { getBlock, readContract, watchContractEvent } from "wagmi/actions";

type FetchAuctionsResponse = {
  auctions: Auction[];
};

export const useAuctionHouseService = () => {
  const { network } = useEnvironmentContext();
  const { chain } = getChainInfo(network);
  const chainId = chain.id;

  const isValidNetwork = useMemo(() => network !== "none" && chainId !== undefined, [network, chainId]);

  const getContractAddress = useCallback((): `0x${string}` | null => {
    if (!isValidNetwork) return null;
    const address = etsAuctionHouseConfig.address[chainId as keyof typeof etsAuctionHouseConfig.address];
    if (!address) {
      console.warn(`No contract address found for chain ID: ${chainId}`);
      return null;
    }
    return address as `0x${string}`;
  }, [chainId, isValidNetwork]);

  const auctionHouseConfig = useMemo(() => {
    const address = getContractAddress();
    return address ? { address, abi: etsAuctionHouseConfig.abi } : null;
  }, [getContractAddress]);

  const fetchAuctionPaused = useCallback(async (): Promise<boolean> => {
    if (!isValidNetwork || !auctionHouseConfig) return false;
    try {
      const data = await readContract(wagmiConfig, {
        ...auctionHouseConfig,
        functionName: "paused",
      });
      return data;
    } catch (error) {
      console.error("Error fetching auction paused state:", error);
      return false;
    }
  }, [auctionHouseConfig, isValidNetwork]);

  const watchAuctionPaused = useCallback(
    (onPaused: () => Promise<void>) => {
      if (!isValidNetwork || !auctionHouseConfig) return () => {};
      return watchContractEvent(wagmiConfig, {
        ...auctionHouseConfig,
        eventName: "Paused",
        onLogs: async () => {
          await onPaused();
        },
      });
    },
    [auctionHouseConfig, isValidNetwork],
  );

  const watchAuctionUnpaused = useCallback(
    (onUnpaused: () => Promise<void>) => {
      if (!isValidNetwork || !auctionHouseConfig) return () => {};
      return watchContractEvent(wagmiConfig, {
        ...auctionHouseConfig,
        eventName: "Unpaused",
        onLogs: async () => {
          await onUnpaused();
        },
      });
    },
    [auctionHouseConfig, isValidNetwork],
  );

  const watchNewAuctionReleased = useCallback(
    (onNewAuction: () => Promise<void>) => {
      if (!isValidNetwork || !auctionHouseConfig) return () => {};
      return watchContractEvent(wagmiConfig, {
        ...auctionHouseConfig,
        eventName: "AuctionCreated",
        onLogs: async () => {
          await onNewAuction();
        },
      });
    },
    [auctionHouseConfig, isValidNetwork],
  );

  const fetchBlockchainTime = useCallback(async (): Promise<number> => {
    if (!isValidNetwork) return 0;
    try {
      const block = await getBlock(wagmiConfig, {
        blockTag: "latest",
      });
      return block ? Number(block.timestamp) : 0;
    } catch (error) {
      console.error("Failed to fetch blockchain time:", error);
      return 0;
    }
  }, [isValidNetwork]);

  const fetchMaxAuctions = useCallback(async (): Promise<number> => {
    if (!isValidNetwork || !auctionHouseConfig) return 0;
    try {
      const data = await readContract(wagmiConfig, {
        ...auctionHouseConfig,
        functionName: "maxAuctions",
      });
      return Number(data);
    } catch (error) {
      console.error("Error fetching max auctions:", error);
      return 0;
    }
  }, [auctionHouseConfig, isValidNetwork]);

  const fetchCurrentAuctionId = useCallback(async (): Promise<number> => {
    if (!isValidNetwork || !auctionHouseConfig) return 0;
    try {
      const data = await readContract(wagmiConfig, {
        ...auctionHouseConfig,
        functionName: "getTotalCount",
      });
      return Number(data);
    } catch (error) {
      console.error("Error fetching current auction ID:", error);
      return 0;
    }
  }, [auctionHouseConfig, isValidNetwork]);

  const fetchAuction = useCallback(
    async (auctionId: number): Promise<AuctionOnChain | null> => {
      if (!isValidNetwork || !auctionHouseConfig) return null;
      try {
        const data = await readContract(wagmiConfig, {
          ...auctionHouseConfig,
          functionName: "getAuction",
          args: [BigInt(auctionId)],
        });
        return {
          id: Number(data.auctionId),
          tokenId: data.tokenId.toString(),
          startTime: Number(data.startTime),
          endTime: Number(data.endTime),
          reservePrice: BigInt(data.reservePrice),
          amount: BigInt(data.amount),
          bidder: `0x${data.bidder.substring(2)}`,
          auctioneer: `0x${data.auctioneer.substring(2)}`,
          settled: data.settled,
        };
      } catch (error) {
        console.error("Error fetching auction:", error);
        return null;
      }
    },
    [auctionHouseConfig, isValidNetwork],
  );

  const fetchAuctionEnded = useCallback(
    async (auctionId: number): Promise<boolean> => {
      if (!isValidNetwork || !auctionHouseConfig) return false;
      try {
        const data = await readContract(wagmiConfig, {
          ...auctionHouseConfig,
          functionName: "auctionEnded",
          args: [BigInt(auctionId)],
        });
        return data;
      } catch (error) {
        console.error("Error fetching auction ended status:", error);
        return false;
      }
    },
    [auctionHouseConfig, isValidNetwork],
  );

  const fetchAuctionSettingsData = useCallback(async (): Promise<AuctionSettings | null> => {
    if (!isValidNetwork) return null;
    const query = `
      query {
        globalSettings: globalSettings(id: "globalSettings") {
          maxAuctions
          minIncrementBidPercentage
          reservePrice
          duration
          timeBuffer
        }
      }
    `;
    try {
      const response = await fetcher(query, {});
      const settings = response.globalSettings;
      return {
        maxAuctions: Number(settings.maxAuctions),
        minIncrementBidPercentage: Number(settings.minIncrementBidPercentage),
        reservePrice: BigInt(settings.reservePrice),
        duration: Number(settings.duration),
        timeBuffer: Number(settings.timeBuffer),
      };
    } catch (error) {
      console.error("Error fetching auction settings data:", error);
      return null;
    }
  }, [isValidNetwork]);

  const fetchAuctionsData = useCallback(
    async ({
      pageSize = 20,
      skip = 0,
      orderBy = "endTime",
      filter = {},
    } = {}): Promise<FetchAuctionsResponse | null> => {
      if (!isValidNetwork) return null;
      const query = `
      query auctions($filter: Auction_filter, $first: Int!, $skip: Int!, $orderBy: String!) {
        auctions: auctions(
          first: $first,
          skip: $skip,
          orderBy: $orderBy,
          orderDirection: desc,
          where: $filter
        ) {
          id
          tokenAuctionNumber
          startTime
          endTime
          extended
          settled
          reservePrice
          amount
          bidder {
            id
          }
          bids {
            id
            blockTimestamp
            amount
            bidder {
              id
            }
          }
          tag {
            id
            timestamp
            machineName
            display
            owner {
              id
            }
            relayer {
              id
              name
            }
            creator {
              id
            }
          }
        }
      }
    `;
      const variables = { filter, first: pageSize, skip, orderBy };
      try {
        const data: FetchAuctionsResponse = await fetcher(query, variables);
        const transformedData = data.auctions.map((auction) => ({
          id: Number(auction.id),
          tokenAuctionNumber: Number(auction.tokenAuctionNumber),
          startTime: Number(auction.startTime),
          endTime: Number(auction.endTime),
          extended: auction.extended,
          ended: false,
          settled: auction.settled,
          reservePrice: BigInt(auction.reservePrice),
          amount: BigInt(auction.amount),
          amountDisplay: formatEtherWithDecimals(auction.amount, 4),
          bidder: { id: auction.bidder.id },
          bids: auction.bids.map((bid) => ({
            id: bid.id,
            blockTimestamp: Number(bid.blockTimestamp),
            amount: BigInt(bid.amount),
            amountDisplay: formatEtherWithDecimals(bid.amount, 4),
            bidder: { id: bid.bidder.id },
          })),
          tag: {
            id: auction.tag.id,
            timestamp: Number(auction.tag.timestamp),
            machineName: auction.tag.machineName,
            display: auction.tag.display,
            owner: { id: auction.tag.owner.id },
            relayer: {
              id: auction.tag.relayer.id,
              name: auction.tag.relayer.name,
            },
            creator: { id: auction.tag.creator.id },
          },
        }));
        return { auctions: transformedData };
      } catch (error) {
        console.error("Error fetching auctions data:", error);
        return null;
      }
    },
    [isValidNetwork],
  );

  return {
    fetchAuctionPaused,
    watchAuctionPaused,
    watchAuctionUnpaused,
    watchNewAuctionReleased,
    fetchBlockchainTime,
    fetchMaxAuctions,
    fetchCurrentAuctionId,
    fetchAuction,
    fetchAuctionEnded,
    fetchAuctionSettingsData,
    fetchAuctionsData,
  };
};

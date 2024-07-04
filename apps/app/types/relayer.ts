import { Hex } from "viem";

export type RawRelayerType = {
  id: Hex;
  name: string;
  firstSeen: number;
  creator: Hex;
  owner: Hex;
  pausedByOwner: boolean;
  lockedByProtocol: boolean;
  publishedTagsAddedToTaggingRecords: number;
  publishedTagsAuctionRevenue: number;
  publishedTagsRemovedFromTaggingRecords: number;
  publishedTagsTaggingFeeRevenue: number;
  taggingRecordTxns: number;
  taggingRecordsPublished: number;
  tagsApplied: number;
  tagsPublished: number;
  tagsRemoved: number;
};

export type RelayerType = Omit<RawRelayerType, "owner"> & {
  owner: {
    id: Hex;
    ens: string | null;
  };
};

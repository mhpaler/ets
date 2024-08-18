import type { Hex } from "viem";

type RawCreatorType = {
  id: Hex;
  firstSeen: string;
  tagsCreated: string;
  createdTagsAddedToTaggingRecords: string;
  createdTagsRemovedFromTaggingRecords: string;
  createdTagsAuctionRevenue: string;
  createdTagsTaggingFeeRevenue: string;
};

export type CreatorType = RawCreatorType & {
  ens: string | null;
};

export type FetchCreatorsResponse = {
  creators: RawCreatorType[];
  nextCreators: { id: string }[];
};

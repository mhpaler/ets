import { Hex } from "viem";

type RawOwnerType = {
  id: Hex;
  firstSeen: string;
  tagsOwned: string;
  tagsOwnedLifeTime: string;
  ownedTagsAddedToTaggingRecords: string;
  ownedTagsRemovedFromTaggingRecords: string;
  ownedTagsTaggingFeeRevenue: string;
};

export type OwnerType = RawOwnerType & {
  ens: string | null;
};

export type FetchOwnersResponse = {
  owners: RawOwnerType[];
  nextOwners: { id: string }[];
};

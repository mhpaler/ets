import type { Hex } from "viem";

type RawTaggerType = {
  id: Hex;
  firstSeen: string;
  taggingRecordsCreated: string;
  tagsApplied: string;
  tagsRemoved: string;
  feesPaid: string;
};

export type TaggerType = RawTaggerType & {
  ens: string | null;
};

export type FetchTaggersResponse = {
  taggers: RawTaggerType[];
  nextTaggers: { id: string }[];
};

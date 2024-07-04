import { Auction } from "@app/types/auction";

export type TagType = {
  id: string;
  premium?: boolean;
  reserved?: boolean;
  timestamp: number;
  machineName: string;
  display: string;
  owner: {
    id: `0x${string}`;
    ens?: string;
  };
  relayer: {
    id: `0x${string}`;
    name?: string;
  };
  creator: {
    id: `0x${string}`;
    ens?: string;
  };
  tagAppliedInTaggingRecord?: number;
  relayerRevenue?: number;
  ownerRevenue?: number;
  protocolRevenue?: number;
  creatorRevenue?: number;
  auctions?: Auction[];
};

export interface TagInput {
  id: string;
  text: string;
}

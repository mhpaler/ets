import type { Hex } from "viem";

export type TaggingRecordType = {
  id: string;
  recordType: string;
  timestamp: string;
  txnHash: string;
  relayer: {
    id: Hex;
    name: string;
  };
  tagger: {
    id: Hex;
    ens?: string;
  };
  tags: Array<{
    id: string;
    display: string;
    machineName: string;
  }>;
  target: {
    id: string;
    targetURI: string;
    targetType: string;
  };
};

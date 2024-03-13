export type Tag = {
  id: string;
  timestamp: number;
  machineName: string;
  display: string;
  owner: {
    id: `0x${string}`;
  };
  relayer: {
    id: `0x${string}`;
    name?: string;
  };
  creator: {
    id: `0x${string}`;
  };
};

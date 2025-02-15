export type SearchResultType = "tags" | "owners" | "creators" | "relayers" | "taggers";

export interface SearchResult {
  type: SearchResultType;
  id: string;
  display?: string;
  ens?: string | null;
  name?: string;
}

export interface TagResult extends SearchResult {
  type: "tags";
  display: string;
}

export interface OwnerResult extends SearchResult {
  type: "owners";
}

export interface CreatorResult extends SearchResult {
  type: "creators";
}

export interface RelayerResult extends SearchResult {
  type: "relayers";
}

export interface TaggerResult extends SearchResult {
  type: "taggers";
}

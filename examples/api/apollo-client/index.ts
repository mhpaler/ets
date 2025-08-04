import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { getSubgraphEndpoint } from "@ethereum-tag-service/subgraph-endpoints";

// Get the correct endpoint for Base Sepolia testnet
const endpoint = getSubgraphEndpoint(84532);

// Initialize Apollo Client
const client = new ApolloClient({
  uri: endpoint,
  cache: new InMemoryCache(),
});

// Query for latest tagging record
const LATEST_TAGGING_RECORD_QUERY = gql`
  query latestTaggingRecord {
    taggingRecords(
      first: 1
      skip: 0
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      recordType
      timestamp
      relayer {
        name
      }
      tagger {
        id
      }
      tags {
        display
        machineName
      }
      target {
        targetURI
        targetType
      }
    }
  }
`;

// Fetch latest tagging record
const { data } = await client.query({
  query: LATEST_TAGGING_RECORD_QUERY,
});

export const taggingInfo =
  data.taggingRecords.length > 0
    ? {
        tags: data.taggingRecords[0].tags,
        targetURI: data.taggingRecords[0].target.targetURI,
        recordId: data.taggingRecords[0].id,
      }
    : {
        tags: [],
        targetURI: null,
        recordId: null,
        message: "No tagging records found",
      };

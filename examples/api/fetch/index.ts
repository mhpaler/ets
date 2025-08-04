import { getSubgraphEndpoint } from "@ethereum-tag-service/subgraph-endpoints";

const endpoint = getSubgraphEndpoint(84532);

console.info("querying endpoint", endpoint);

const graphqlQuery = {
  query: `
    {
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
  `,
};

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(graphqlQuery),
});

const { data } = await response.json();

console.info(JSON.stringify(data, null, 2));

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

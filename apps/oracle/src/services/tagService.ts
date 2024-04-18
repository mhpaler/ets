/**
 * TagService is a class responsible for retrieving the next tag to be auctioned based on certain criteria.
 */

import subgraphEndpoints from "@ethereum-tag-service/subgraph-endpoints";
import axios, { AxiosResponse } from "axios";

// Define the TagService class.\
export class TagService {
  /**
   * Retrieves the next tag to be auctioned.
   *
   * The logic for selecting the next tag is as follows:
   *
   * 1. Construct a GraphQL query to retrieve all tags owned by the ETS Platform, excluding the last auctioned tag.
   * 2. Filter the fetched tags to include only those with a positive "tagAppliedInTaggingRecord" count.
   * 3. If there are no tags with a positive "tagAppliedInTaggingRecord" count, select the oldest tag.
   * 4. If there are tags with a positive "tagAppliedInTaggingRecord" count, select the tag with the highest count.
   * 5. If there are multiple tags with an equal high "tagAppliedInTaggingRecord" count, select the oldest tag among them.
   *
   * @param platformAddress - The platform address obtained from the blockchain.
   * @param lastAuctionTokenId - The ID of the last auctioned token obtained from the blockchain.
   * @returns A Promise that resolves to the ID of the next tag to be auctioned.
   * @throws An error if there's an issue with the blockchain or GraphQL queries.
   */
  public async findNextCTAG(platformAddress: string, lastAuctionTokenId: string): Promise<string> {
    // Get the environment from the NEXT_PUBLIC_ETS_ENVIRONMENT variable
    // Maps to development/stage/production
    const environment: string = process.env.NEXT_PUBLIC_ETS_ENVIRONMENT || "development";

    // Use the environment to select the appropriate endpoint
    const GRAPH_API_ENDPOINT: string = subgraphEndpoints[environment];
    try {
      // Use the provided platformAddress and lastAuctionTokenId
      console.log("ETS Platform Address: ", platformAddress);
      console.log("Last Auction Token Id: ", lastAuctionTokenId);

      const query = `
      query tags {
        tags(
          orderBy: tagAppliedInTaggingRecord
          orderDirection: desc
          where: {
            owner_: { id: "${platformAddress}" }
            id_not: "${lastAuctionTokenId}"
          }
        ) {
          id
          display
          timestamp
          tagAppliedInTaggingRecord
        }
      }
      `;

      interface CTAG {
        id: string;
        display: string;
        tagAppliedInTaggingRecord: number;
        timestamp: number;
      }

      const response: AxiosResponse<{ data: { tags: CTAG[] } }> = await axios.post(GRAPH_API_ENDPOINT, { query });
      const tags = response.data.data.tags;

      // Filter tags with tagAppliedInTaggingRecord > 0
      const filteredTags = tags.filter((tag) => tag.tagAppliedInTaggingRecord > 0);

      if (filteredTags.length === 0) {
        // If no tags with tagAppliedInTaggingRecord > 0, use the oldest tag
        tags.sort((a, b) => a.timestamp - b.timestamp);
        const oldestTag = tags[0];
        console.log(
          `Next token to release (no tags with tagAppliedInTaggingRecord > 0): ${oldestTag.display} with id ${oldestTag.id}`,
        );
        return oldestTag.id;
      } else {
        // Sort the filtered tags by tagAppliedInTaggingRecord in descending order
        filteredTags.sort((a, b) => b.tagAppliedInTaggingRecord - a.tagAppliedInTaggingRecord);
        const highestTag = filteredTags[0];
        console.log(
          `Next token to release (highest tagAppliedInTaggingRecord > 0): ${highestTag.display} with id ${highestTag.id}`,
        );
        return highestTag.id;
      }
    } catch (error: any) {
      console.error("Error querying The Graph:", error.message);
      throw error;
    }
  }
}

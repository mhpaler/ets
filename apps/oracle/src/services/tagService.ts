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
   * 1. Retrieve all tags owned by the ETS Platform
   * 2. Filter out (remove) tags where any associated auction is not settled.
   * 3. Filter out tags with "tagAppliedInTaggingRecord" count of 0.
   * 3. If there are no tags with a positive "tagAppliedInTaggingRecord" count, select the oldest tag.
   * 4. If there are tags with a positive "tagAppliedInTaggingRecord" count, select the tag with the highest count.
   * 5. If there are multiple tags with an equal high "tagAppliedInTaggingRecord" count, select the oldest tag among them.
   *
   * @param platformAddress - The platform address obtained from the blockchain.
   * @param lastAuctionTokenId - The ID of the last auctioned token obtained from the blockchain.
   * @returns A Promise that resolves to the ID of the next tag to be auctioned.
   * @throws An error if there's an issue with the blockchain or GraphQL queries.
   */
  public async findNextCTAG(platformAddress: string): Promise<string> {
    // Get the environment from the NEXT_PUBLIC_ETS_ENVIRONMENT variable
    // Maps to development/stage/production
    const environment: string = process.env.NEXT_PUBLIC_ETS_ENVIRONMENT || "development";

    // Use the environment to select the appropriate endpoint
    const GRAPH_API_ENDPOINT: string = subgraphEndpoints[environment];
    try {
      // Use the provided platformAddress and lastAuctionTokenId
      console.log("Graph Environment: ", environment);
      console.log("Graph API Endpoint: ", GRAPH_API_ENDPOINT);
      console.log("ETS Platform Address: ", platformAddress);
      //console.log("Last Auction Token Id: ", lastAuctionTokenId);

      const query = `
      query tags {
        tags(
          orderBy: tagAppliedInTaggingRecord
          orderDirection: desc
          where: {
            owner_: { id: "${platformAddress}" }
          }
        ) {
          id
          display
          timestamp
          tagAppliedInTaggingRecord
          auctions {
            id
            settled
          }
        }
      }
      `;

      interface Auction {
        id: string;
        settled: boolean;
        startTime: number;
      }

      interface Tag {
        id: string;
        display: string;
        tagAppliedInTaggingRecord: number;
        timestamp: number;
        auctions: Auction[];
      }

      const response: AxiosResponse<{ data: { tags: Tag[] } }> = await axios.post(GRAPH_API_ENDPOINT, { query });
      let eligibleTags = response.data.data.tags;

      // Remove tags where any associated auction is not settled or if there are no auctions.
      eligibleTags = eligibleTags.filter(
        (tag) => tag.auctions.length === 0 || tag.auctions.every((auction) => auction.settled),
      );

      // Continue with tags that have a positive tagAppliedInTaggingRecord count.
      eligibleTags = eligibleTags.filter((tag) => tag.tagAppliedInTaggingRecord > 0);

      if (eligibleTags.length === 0) {
        // If there are no tags left after filtering, sort all tags by timestamp to find the oldest.
        response.data.data.tags.sort((a, b) => a.timestamp - b.timestamp);
        const oldestTag = response.data.data.tags[0];
        console.log(
          `Next token to release (no eligible tags with positive records): ${oldestTag.display} with id ${oldestTag.id}`,
        );
        return oldestTag.id;
      } else {
        // Sort the filtered eligible tags by tagAppliedInTaggingRecord in descending order.
        eligibleTags.sort((a, b) => b.tagAppliedInTaggingRecord - a.tagAppliedInTaggingRecord);
        const mostUsedTag = eligibleTags[0];
        console.log(
          `Next token to release (highest tagAppliedInTaggingRecord): ${mostUsedTag.display} with id ${mostUsedTag.id}`,
        );
        return mostUsedTag.id;
      }
    } catch (error: any) {
      console.error("Error querying The Graph:", error.message);
      throw error;
    }
  }
}

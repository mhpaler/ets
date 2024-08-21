import subgraphEndpoints from "@ethereum-tag-service/subgraph-endpoints";
import axios, { type AxiosResponse } from "axios";

interface Auction {
  id: string;
  settled: boolean;
}

interface Tag {
  id: string;
  display: string;
  timestamp: number;
  tagAppliedInTaggingRecord: number;
  auctions: Auction[];
}

export class TagService {
  private async fetchTags(platformAddress: string): Promise<Tag[]> {
    const environment: string = process.env.NEXT_PUBLIC_ETS_ENVIRONMENT || "development";
    const endpoint: string = subgraphEndpoints[environment];
    console.info("Reading from GraphQL endpoint: ", endpoint);
    console.info("Platform address:", platformAddress);
    const query: string = `
      query {
        tags(
          orderBy: tagAppliedInTaggingRecord,
          orderDirection: desc,
          where: { owner_: { id: "${platformAddress}" } }
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

    try {
      const response: AxiosResponse<{ data: { tags: Tag[] } }> = await axios.post(endpoint, { query });
      return response.data.data.tags;
    } catch (error: any) {
      console.error("Error fetching tags:", error.message);
      throw new Error("Failed to fetch tags from GraphQL API");
    }
  }

  private filterEligibleTags(tags: Tag[]): Tag[] {
    return tags.filter((tag) => tag.auctions.length === 0 || tag.auctions.every((auction) => auction.settled));
  }

  /**
   * Selects the most appropriate tag for auction based on specific criteria.
   *
   * @param tags An array of tags fetched from the database.
   * @returns The selected tag or null if no eligible tags are found.
   */
  private selectTagForAuction(tags: Tag[]): Tag | null {
    // If no tags are available, return null indicating no selection can be made.
    if (tags.length === 0) {
      return null;
    }

    // Filter tags to include only those with a positive tagAppliedInTaggingRecord count.
    const tagsWithRecords = tags.filter((tag) => tag.tagAppliedInTaggingRecord > 0);

    // If there are any tags with positive records, select the one with the highest record.
    // This uses Array.reduce to find the tag with the maximum tagAppliedInTaggingRecord.
    if (tagsWithRecords.length > 0) {
      return tagsWithRecords.reduce((prev, current) =>
        prev.tagAppliedInTaggingRecord > current.tagAppliedInTaggingRecord ? prev : current,
      );
    }

    // If no tags have a positive record, select the oldest tag based on the timestamp.
    // This uses Array.reduce to find the tag with the earliest timestamp.
    return tags.reduce((prev, current) => (prev.timestamp < current.timestamp ? prev : current));
  }

  public async findNextCTAG(platformAddress: string): Promise<string | null> {
    const tags = await this.fetchTags(platformAddress);
    const eligibleTags = this.filterEligibleTags(tags);

    if (eligibleTags.length === 0) {
      console.info("No eligible tags available for auctioning.");
      return null;
    }

    const selectedTag = this.selectTagForAuction(eligibleTags);
    if (!selectedTag) {
      console.info("No suitable tag found after filtering.");
      return null;
    }

    console.info(`Next tag selected for auction: ${selectedTag.display} with ID ${selectedTag.id}`);
    return selectedTag.id;
  }
}

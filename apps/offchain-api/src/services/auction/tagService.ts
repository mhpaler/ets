import { getSubgraphEndpoint } from "@ethereum-tag-service/subgraph-endpoints";
import axios, { type AxiosResponse } from "axios";
import { config } from "../../config";
import { AppError } from "../../utils/errorHandler";
import { logger } from "../../utils/logger";

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
  /**
   * Fetch tags from the subgraph that are owned by the platform address
   */
  private async fetchTags(platformAddress: string, chainId: number, environment = "production"): Promise<Tag[]> {
    try {
      const endpoint = getSubgraphEndpoint(chainId, environment as any);
      logger.info(`Using subgraph endpoint for chainId ${chainId} (environment: ${environment}): ${endpoint}`);
      logger.info(`Platform address: "${platformAddress}" (${environment})`);
      logger.info(
        "Platform address value check:",
        JSON.stringify({
          value: platformAddress,
          type: typeof platformAddress,
          length: platformAddress?.length,
          isEmpty: !platformAddress,
        }),
      );

      // Process the platform address
      const normalizedAddress = platformAddress ? platformAddress.toLowerCase() : "";
      logger.info(`Normalized address for query: "${normalizedAddress}"`);

      // Compare with platform address from other environment (for debugging)
      try {
        const otherEnv = environment === "production" ? "staging" : "production";
        const { createAccessControlsClient } = require("@ethereum-tag-service/sdk-core");

        const otherEnvClient = createAccessControlsClient({
          chainId,
          environment: otherEnv,
        });

        if (otherEnvClient) {
          const otherPlatformAddress = await otherEnvClient.getPlatformAddress();
          logger.info(`Comparison - ${otherEnv} environment platform address: "${otherPlatformAddress}"`);

          if (normalizedAddress === otherPlatformAddress?.toLowerCase()) {
            logger.warn(`Platform addresses are identical between ${environment} and ${otherEnv} environments`);
          }
        }
      } catch (error) {
        logger.warn(`Error comparing platform addresses between environments: ${error}`);
      }

      // Construct GraphQL query
      const query: string = `
        query {
          tags(
            orderBy: tagAppliedInTaggingRecord,
            orderDirection: desc,
            where: { owner_: { id: "${normalizedAddress}" } }
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

      const response: AxiosResponse<{ data: { tags: Tag[] } }> = await axios.post(endpoint, { query });
      logger.info(`Retrieved ${response.data.data.tags.length} tags from subgraph`);
      return response.data.data.tags;
    } catch (error: any) {
      logger.error("Error fetching tags:", error.message);
      if (axios.isAxiosError(error) && error.response) {
        logger.error("Response data:", error.response.data);
        logger.error("Response status:", error.response.status);
      }
      throw new AppError(`Failed to fetch tags from GraphQL API for chainId ${chainId}`, 500);
    }
  }

  /**
   * Filter tags to find those eligible for auction (never auctioned or all auctions settled)
   */
  private filterEligibleTags(tags: Tag[]): Tag[] {
    const eligibleTags = tags.filter(
      (tag) => tag.auctions.length === 0 || tag.auctions.every((auction) => auction.settled),
    );
    logger.info(`Filtered ${tags.length} tags to ${eligibleTags.length} eligible tags`);
    return eligibleTags;
  }

  /**
   * Selects the most appropriate tag for auction based on specific criteria:
   * 1. Tags with positive usage (tagAppliedInTaggingRecord) are prioritized, with highest usage selected
   * 2. If no tags have been used, select the oldest tag
   */
  private selectTagForAuction(tags: Tag[]): Tag | null {
    if (tags.length === 0) {
      logger.info("No tags available for selection");
      return null;
    }

    // First prioritize tags that have been used in tagging records
    const tagsWithRecords = tags.filter((tag) => tag.tagAppliedInTaggingRecord > 0);
    logger.info(`Found ${tagsWithRecords.length} tags with positive tagAppliedInTaggingRecord`);

    if (tagsWithRecords.length > 0) {
      // Select the tag with the highest usage
      const selected = tagsWithRecords.reduce((prev, current) =>
        prev.tagAppliedInTaggingRecord > current.tagAppliedInTaggingRecord ? prev : current,
      );
      logger.info(`Selected tag with highest tagAppliedInTaggingRecord: ${selected.id} (${selected.display})`);
      return selected;
    }

    // If no tags have been used, select the oldest tag
    const oldest = tags.reduce((prev, current) => (prev.timestamp < current.timestamp ? prev : current));
    logger.info(`Selected oldest tag: ${oldest.id} (${oldest.display})`);
    return oldest;
  }

  /**
   * Find the next CTAG that should be auctioned
   * @param platformAddress The platform address that owns the tags
   * @param chainId The chain ID to query
   * @param environment The environment (production, staging, localhost)
   * @returns The tag ID of the next tag to auction, or null if no eligible tags are found
   */
  public async findNextCTAG(
    platformAddress: string,
    chainId: number,
    environment = "production",
  ): Promise<{ tagId: string; tagDisplay: string } | null> {
    logger.info(
      `Finding next CTAG for platform address ${platformAddress} on chain ${chainId} (environment: ${environment})`,
    );

    // Validate platform address
    if (!platformAddress) {
      logger.error(`Invalid platform address provided for chain ${chainId} (${environment}): ${platformAddress}`);
      throw new AppError(`Platform address is required for chain ${chainId}`, 500);
    }

    try {
      // Verify the environment is valid and use a local variable
      let envToUse = environment;
      if (envToUse !== "production" && envToUse !== "staging" && envToUse !== "localhost") {
        logger.warn(`Unsupported environment "${envToUse}", defaulting to "production"`);
        envToUse = "production";
      }

      const tags = await this.fetchTags(platformAddress, chainId, envToUse);
      const eligibleTags = this.filterEligibleTags(tags);

      if (eligibleTags.length === 0) {
        logger.info("No eligible tags available for auctioning.");
        return null;
      }

      const selectedTag = this.selectTagForAuction(eligibleTags);
      if (!selectedTag) {
        logger.info("No suitable tag found after filtering.");
        return null;
      }

      logger.info(`Next tag selected for auction: ${selectedTag.display} with ID ${selectedTag.id}`);
      return {
        tagId: selectedTag.id,
        tagDisplay: selectedTag.display,
      };
    } catch (error) {
      logger.error("Error in findNextCTAG:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}

// Export a singleton instance
export const tagService = new TagService();

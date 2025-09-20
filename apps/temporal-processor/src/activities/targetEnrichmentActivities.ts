import axios from "axios";
import { http, type Hash, createPublicClient, createWalletClient, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, localhost, sepolia } from "viem/chains";
import { config } from "../config";
import type { EnrichmentEventResult, MetadataFetchResult } from "../types";
import { getComponentLogger } from "../utils/logger";

const logger = getComponentLogger("TargetEnrichmentActivities");

// Get chain configuration
function getChain() {
  switch (config.blockchain.chainId) {
    case 31337:
      return localhost;
    case 11155111:
      return sepolia;
    case 8453:
      return base;
    default:
      return localhost;
  }
}

/**
 * Activity: Fetch metadata from target URI
 *
 * This activity directly fetches metadata from the target URI without
 * depending on offchain-api. It handles various content types and
 * extracts relevant metadata.
 */
export async function fetchTargetMetadata(params: {
  targetId: string;
  targetURI: string;
}): Promise<MetadataFetchResult> {
  try {
    logger.info({ targetId: params.targetId, uri: params.targetURI }, "Fetching target metadata");

    // Direct fetch from the target URI
    const response = await axios.get(params.targetURI, {
      timeout: 30000, // 30 second timeout
      headers: {
        "User-Agent": "ETS-TemporalProcessor/1.0",
        Accept: "text/html,application/json,application/ld+json",
      },
      validateStatus: (status) => status < 500, // Accept any status < 500
    });

    // Extract metadata based on content type
    let metadata: Partial<MetadataFetchResult> = {};

    if (response.status === 404) {
      throw new Error("Target URI not found");
    }

    const contentType = response.headers["content-type"] || "";

    if (contentType.includes("application/json")) {
      // Handle JSON responses (APIs, JSON-LD, etc.)
      const data = response.data;
      metadata = {
        title: data.title || data.name || params.targetURI,
        description: data.description || data.about || "",
        image: data.image || data.logo || data.thumbnail || "",
        keywords: Array.isArray(data.keywords)
          ? data.keywords
          : data.tags
            ? Array.isArray(data.tags)
              ? data.tags
              : [data.tags]
            : [],
        targetType: data.type || "json",
      };
    } else if (contentType.includes("text/html")) {
      // For HTML, extract basic metadata from the response
      // In production, you'd use a proper HTML parser like cheerio
      const html = response.data.toString();

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const metaTitle = html.match(/<meta\s+(?:name|property)="(?:og:title|twitter:title)"[^>]*content="([^"]+)"/i);

      // Extract description
      const metaDesc = html.match(
        /<meta\s+(?:name|property)="(?:description|og:description|twitter:description)"[^>]*content="([^"]+)"/i,
      );

      // Extract image
      const metaImage = html.match(/<meta\s+(?:name|property)="(?:og:image|twitter:image)"[^>]*content="([^"]+)"/i);

      // Extract keywords
      const metaKeywords = html.match(/<meta\s+name="keywords"[^>]*content="([^"]+)"/i);

      metadata = {
        title: metaTitle?.[1] || titleMatch?.[1] || params.targetURI,
        description: metaDesc?.[1] || "",
        image: metaImage?.[1] || "",
        keywords: metaKeywords?.[1]?.split(",").map((k: string) => k.trim()) || [],
        targetType: "webpage",
      };
    } else {
      // Default metadata for other content types
      metadata = {
        title: params.targetURI.split("/").pop() || params.targetURI,
        description: `Content from ${params.targetURI}`,
        image: "",
        keywords: [],
        targetType: contentType.split("/")[0] || "unknown",
      };
    }

    logger.info({ targetId: params.targetId, metadata }, "Successfully fetched metadata");

    return {
      title: metadata.title,
      description: metadata.description,
      image: metadata.image,
      keywords: metadata.keywords,
      targetType: metadata.targetType,
      status: "success",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ targetId: params.targetId, error: errorMessage }, "Failed to fetch metadata");

    return {
      status: "failed",
      error: errorMessage,
    };
  }
}

/**
 * Activity: Emit target enrichment event on-chain
 *
 * This activity emits an enrichment event with the fetched metadata
 * for The Graph to index. No storage, just event emission.
 */
export async function emitTargetEnrichmentEvent(params: {
  targetId: string;
  metadata: MetadataFetchResult;
}): Promise<EnrichmentEventResult> {
  try {
    logger.info({ targetId: params.targetId }, "Emitting target enrichment event");

    // Check if we have a private key configured
    const privateKey = process.env.EVENT_PROCESSOR_PRIVATE_KEY || process.env.PRIVATE_KEY;
    if (!privateKey) {
      logger.warn("No private key configured, skipping enrichment event");
      return {
        transactionHash: "0x0" as Hash,
        status: "failed",
        error: "No private key configured for enrichment events",
      };
    }

    // Create wallet client for transactions
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const chain = getChain();

    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(config.blockchain.rpcUrl),
    });

    const publicClient = createPublicClient({
      chain,
      transport: http(config.blockchain.rpcUrl),
    });

    // Prepare keywords as comma-separated string
    const keywordsString = params.metadata.keywords?.join(",") || "";

    // ABI for the enrichTarget function
    const enrichTargetAbi = parseAbi([
      "function enrichTarget(uint256 targetId, string memory title, string memory description, string memory imageUrl, string memory keywords) external",
      "event TargetEnriched(uint256 indexed targetId, string title, string description, string imageUrl, string keywords)",
    ]);

    // Simulate the transaction first
    const { request } = await publicClient.simulateContract({
      address: config.blockchain.contracts.etsEnrichTarget,
      abi: enrichTargetAbi,
      functionName: "enrichTarget",
      args: [
        BigInt(params.targetId),
        params.metadata.title || "",
        params.metadata.description || "",
        params.metadata.image || "",
        keywordsString,
      ],
      account,
    });

    // Execute the transaction
    const hash = await walletClient.writeContract(request);

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
      logger.info(
        {
          targetId: params.targetId,
          transactionHash: hash,
        },
        "Successfully emitted enrichment event",
      );

      return {
        transactionHash: hash,
        status: "success",
      };
    }
    throw new Error("Transaction reverted");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ targetId: params.targetId, error: errorMessage }, "Failed to emit enrichment event");

    return {
      transactionHash: "0x0" as Hash,
      status: "failed",
      error: errorMessage,
    };
  }
}

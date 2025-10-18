import { Bytes, BigInt as GraphBigInt, json, log } from "@graphprotocol/graph-ts";
import { HtmlMetadata, ImageMetadata, Target } from "../generated/schema";

/**
 * Parsed metadata structure matching ETSTargetMetadata from temporal-processor
 */
class ParsedMetadata {
  core: CoreMetadata;
  type: string;
  platform: string | null;
  keywords: string[];
  extensions: MetadataExtensions | null;

  constructor() {
    this.core = new CoreMetadata();
    this.type = "unknown";
    this.platform = null;
    this.keywords = [];
    this.extensions = null;
  }
}

class CoreMetadata {
  uri: string;
  title: string;
  description: string;
  image: string | null;
  favicon: string | null;
  httpStatus: i32;
  contentType: string;
  language: string;
  extractedAt: string;
  extractionMethod: string;

  constructor() {
    this.uri = "";
    this.title = "";
    this.description = "";
    this.image = null;
    this.favicon = null;
    this.httpStatus = 0;
    this.contentType = "";
    this.language = "";
    this.extractedAt = "";
    this.extractionMethod = "";
  }
}

class MetadataExtensions {
  creator: CreatorInfo | null;
  dates: DateInfo | null;
  media: MediaInfo | null;
  metrics: MetricsInfo | null;
  context: ContextInfo | null;

  constructor() {
    this.creator = null;
    this.dates = null;
    this.media = null;
    this.metrics = null;
    this.context = null;
  }
}

class CreatorInfo {
  name: string | null;
  url: string | null;
  handle: string | null;
  verified: boolean;

  constructor() {
    this.name = null;
    this.url = null;
    this.handle = null;
    this.verified = false;
  }
}

class DateInfo {
  published: string | null;
  modified: string | null;

  constructor() {
    this.published = null;
    this.modified = null;
  }
}

class MediaInfo {
  duration: i32;
  width: i32;
  height: i32;
  size: i32;
  thumbnails: string[];

  constructor() {
    this.duration = 0;
    this.width = 0;
    this.height = 0;
    this.size = 0;
    this.thumbnails = [];
  }
}

class MetricsInfo {
  views: i64;
  likes: i64;
  stars: i64;
  forks: i64;
  reposts: i64;
  replies: i64;

  constructor() {
    this.views = 0;
    this.likes = 0;
    this.stars = 0;
    this.forks = 0;
    this.reposts = 0;
    this.replies = 0;
  }
}

class ContextInfo {
  isReply: boolean;
  threadId: string | null;
  quotedPost: string | null;
  channel: string | null;

  constructor() {
    this.isReply = false;
    this.threadId = null;
    this.quotedPost = null;
    this.channel = null;
  }
}

/**
 * Parse TargetEnriched event payload (UTF-8 JSON bytes)
 * Note: AssemblyScript doesn't support try-catch, so we use explicit error checking
 */
export function parseEnrichmentPayload(payload: Bytes): ParsedMetadata | null {
  const parsed = new ParsedMetadata();

  // Convert bytes to UTF-8 string
  const jsonString = payload.toString();
  log.info("Parsing enrichment payload: {}", [jsonString]);

  // Parse JSON
  const jsonData = json.try_fromString(jsonString);
  if (jsonData.isError) {
    log.error("Failed to parse JSON from payload", []);
    return null;
  }

  const obj = jsonData.value.toObject();
  if (!obj) {
    log.error("Payload is not a JSON object", []);
    return null;
  }

  // Parse core metadata
  const coreObj = obj.get("core");
  if (coreObj) {
    const core = coreObj.toObject();
    if (core) {
      const uri = core.get("uri");
      if (uri) parsed.core.uri = uri.toString();

      const title = core.get("title");
      if (title) parsed.core.title = title.toString();

      const description = core.get("description");
      if (description) parsed.core.description = description.toString();

      const image = core.get("image");
      if (image && !image.isNull()) parsed.core.image = image.toString();

      const favicon = core.get("favicon");
      if (favicon && !favicon.isNull()) parsed.core.favicon = favicon.toString();

      const httpStatus = core.get("httpStatus");
      if (httpStatus) parsed.core.httpStatus = httpStatus.toI64() as i32;

      const contentType = core.get("contentType");
      if (contentType) parsed.core.contentType = contentType.toString();

      const language = core.get("language");
      if (language) parsed.core.language = language.toString();

      const extractedAt = core.get("extractedAt");
      if (extractedAt) parsed.core.extractedAt = extractedAt.toString();

      const extractionMethod = core.get("extractionMethod");
      if (extractionMethod) parsed.core.extractionMethod = extractionMethod.toString();
    }
  }

  // Parse type
  const typeValue = obj.get("type");
  if (typeValue) parsed.type = typeValue.toString();

  // Parse platform
  const platformValue = obj.get("platform");
  if (platformValue && !platformValue.isNull()) {
    parsed.platform = platformValue.toString();
  }

  // Parse keywords
  const keywordsValue = obj.get("keywords");
  if (keywordsValue) {
    const keywordsArray = keywordsValue.toArray();
    for (let i = 0; i < keywordsArray.length; i++) {
      parsed.keywords.push(keywordsArray[i].toString());
    }
  }

  // Parse extensions
  const extensionsValue = obj.get("extensions");
  if (extensionsValue && !extensionsValue.isNull()) {
    const extensions = new MetadataExtensions();
    const extObj = extensionsValue.toObject();

    if (extObj) {
      // Creator
      const creatorValue = extObj.get("creator");
      if (creatorValue && !creatorValue.isNull()) {
        const creator = new CreatorInfo();
        const creatorObj = creatorValue.toObject();
        if (creatorObj) {
          const name = creatorObj.get("name");
          if (name && !name.isNull()) creator.name = name.toString();

          const url = creatorObj.get("url");
          if (url && !url.isNull()) creator.url = url.toString();

          const handle = creatorObj.get("handle");
          if (handle && !handle.isNull()) creator.handle = handle.toString();

          const verified = creatorObj.get("verified");
          if (verified) creator.verified = verified.toBool();
        }
        extensions.creator = creator;
      }

      // Dates
      const datesValue = extObj.get("dates");
      if (datesValue && !datesValue.isNull()) {
        const dates = new DateInfo();
        const datesObj = datesValue.toObject();
        if (datesObj) {
          const published = datesObj.get("published");
          if (published && !published.isNull()) dates.published = published.toString();

          const modified = datesObj.get("modified");
          if (modified && !modified.isNull()) dates.modified = modified.toString();
        }
        extensions.dates = dates;
      }

      // Media
      const mediaValue = extObj.get("media");
      if (mediaValue && !mediaValue.isNull()) {
        const media = new MediaInfo();
        const mediaObj = mediaValue.toObject();
        if (mediaObj) {
          const duration = mediaObj.get("duration");
          if (duration) media.duration = duration.toI64() as i32;

          const width = mediaObj.get("width");
          if (width) media.width = width.toI64() as i32;

          const height = mediaObj.get("height");
          if (height) media.height = height.toI64() as i32;

          const size = mediaObj.get("size");
          if (size) media.size = size.toI64() as i32;

          const thumbnails = mediaObj.get("thumbnails");
          if (thumbnails) {
            const thumbArray = thumbnails.toArray();
            for (let i = 0; i < thumbArray.length; i++) {
              media.thumbnails.push(thumbArray[i].toString());
            }
          }
        }
        extensions.media = media;
      }

      // Metrics
      const metricsValue = extObj.get("metrics");
      if (metricsValue && !metricsValue.isNull()) {
        const metrics = new MetricsInfo();
        const metricsObj = metricsValue.toObject();
        if (metricsObj) {
          const views = metricsObj.get("views");
          if (views) metrics.views = views.toI64();

          const likes = metricsObj.get("likes");
          if (likes) metrics.likes = likes.toI64();

          const stars = metricsObj.get("stars");
          if (stars) metrics.stars = stars.toI64();

          const forks = metricsObj.get("forks");
          if (forks) metrics.forks = forks.toI64();

          const reposts = metricsObj.get("reposts");
          if (reposts) metrics.reposts = reposts.toI64();

          const replies = metricsObj.get("replies");
          if (replies) metrics.replies = replies.toI64();
        }
        extensions.metrics = metrics;
      }

      // Context
      const contextValue = extObj.get("context");
      if (contextValue && !contextValue.isNull()) {
        const context = new ContextInfo();
        const contextObj = contextValue.toObject();
        if (contextObj) {
          const isReply = contextObj.get("isReply");
          if (isReply) context.isReply = isReply.toBool();

          const threadId = contextObj.get("threadId");
          if (threadId && !threadId.isNull()) context.threadId = threadId.toString();

          const quotedPost = contextObj.get("quotedPost");
          if (quotedPost && !quotedPost.isNull()) context.quotedPost = quotedPost.toString();

          const channel = contextObj.get("channel");
          if (channel && !channel.isNull()) context.channel = channel.toString();
        }
        extensions.context = context;
      }
    }

    parsed.extensions = extensions;
  }

  return parsed;
}

/**
 * Convert ISO 8601 timestamp string to BigInt (Unix timestamp in seconds)
 */
function isoToBigInt(_iso: string): GraphBigInt {
  // For now, return 0 - proper ISO parsing in AssemblyScript is complex
  // The timestamp is stored as string in extractedAt field
  return GraphBigInt.fromI32(0);
}

/**
 * Update Target entity with enrichment metadata
 */
export function updateTargetWithMetadata(
  target: Target,
  metadata: ParsedMetadata,
  enrichedBy: string,
  schemaVersion: string,
  payloadHash: string,
  timestamp: GraphBigInt,
): void {
  // Update enrichment tracking
  target.enriched = timestamp;
  target.enrichedBy = enrichedBy;
  target.schemaVersion = schemaVersion;
  target.payloadHash = payloadHash;

  // Update core metadata
  target.title = metadata.core.title;
  target.description = metadata.core.description;
  target.image = metadata.core.image;
  target.favicon = metadata.core.favicon;
  target.httpStatus = GraphBigInt.fromI32(metadata.core.httpStatus);
  target.contentType = metadata.core.contentType;
  target.language = metadata.core.language;
  target.extractionMethod = metadata.core.extractionMethod;

  // Convert extractedAt to timestamp
  if (metadata.core.extractedAt) {
    target.extractedAt = isoToBigInt(metadata.core.extractedAt);
  }

  // Set type and platform
  target.metadataType = metadata.type;
  target.platform = metadata.platform;

  // Set keywords
  if (metadata.keywords.length > 0) {
    target.keywords = metadata.keywords;
  }

  target.save();

  // Create type-specific metadata entities
  const extensions = metadata.extensions;
  if (extensions) {
    // For HTML/article/video content, create HtmlMetadata
    if (
      metadata.type === "article" ||
      metadata.type === "video" ||
      metadata.type === "social_post" ||
      metadata.type === "profile"
    ) {
      createOrUpdateHtmlMetadata(target.id, metadata, extensions);
      target.htmlMetadata = target.id;
    }

    // For image content, create ImageMetadata
    if (metadata.type === "image") {
      createOrUpdateImageMetadata(target.id, metadata, extensions);
      target.imageMetadata = target.id;
    }
  }

  target.save();
}

/**
 * Create or update HtmlMetadata entity
 */
function createOrUpdateHtmlMetadata(targetId: string, metadata: ParsedMetadata, extensions: MetadataExtensions): void {
  let htmlMetadata = HtmlMetadata.load(targetId);
  if (!htmlMetadata) {
    htmlMetadata = new HtmlMetadata(targetId);
  }

  // Basic fields
  htmlMetadata.title = metadata.core.title;
  htmlMetadata.description = metadata.core.description;
  htmlMetadata.favicon = metadata.core.favicon;

  // Creator info
  const creator = extensions.creator;
  if (creator) {
    htmlMetadata.creatorName = creator.name;
    htmlMetadata.creatorUrl = creator.url;
    htmlMetadata.creatorHandle = creator.handle;
    htmlMetadata.creatorVerified = creator.verified;
  }

  // Dates
  const dates = extensions.dates;
  if (dates) {
    const published = dates.published;
    if (published) {
      htmlMetadata.publishedAt = isoToBigInt(published);
    }
    const modified = dates.modified;
    if (modified) {
      htmlMetadata.modifiedAt = isoToBigInt(modified);
    }
  }

  // Metrics
  const metrics = extensions.metrics;
  if (metrics) {
    htmlMetadata.views = GraphBigInt.fromI64(metrics.views);
    htmlMetadata.likes = GraphBigInt.fromI64(metrics.likes);
    htmlMetadata.reposts = GraphBigInt.fromI64(metrics.reposts);
    htmlMetadata.replies = GraphBigInt.fromI64(metrics.replies);
  }

  // Context
  const context = extensions.context;
  if (context) {
    htmlMetadata.isReply = context.isReply;
    htmlMetadata.threadId = context.threadId;
    htmlMetadata.quotedPost = context.quotedPost;
    htmlMetadata.channel = context.channel;
  }

  htmlMetadata.save();
}

/**
 * Create or update ImageMetadata entity
 */
function createOrUpdateImageMetadata(targetId: string, metadata: ParsedMetadata, extensions: MetadataExtensions): void {
  let imageMetadata = ImageMetadata.load(targetId);
  if (!imageMetadata) {
    imageMetadata = new ImageMetadata(targetId);
  }

  // Media info
  const media = extensions.media;
  if (media) {
    imageMetadata.width = media.width;
    imageMetadata.height = media.height;
    imageMetadata.fileSize = media.size;
    imageMetadata.mimeType = metadata.core.contentType;
    imageMetadata.duration = media.duration;

    if (media.thumbnails.length > 0) {
      imageMetadata.thumbnails = media.thumbnails;
    }
  }

  imageMetadata.save();
}

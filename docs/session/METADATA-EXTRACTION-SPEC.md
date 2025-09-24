# ETS Metadata Extraction Specification

## Overview

This document defines the metadata extraction strategy for the Ethereum Tag Service (ETS). The goal is to enrich bare URIs with contextual information that makes tags more meaningful and discoverable, while optimizing for smart contract events and The Graph indexing.

## Core Principles

### Chief Goal
Transform tagged URLs from opaque identifiers into rich, searchable, and meaningful content by extracting:
- **Core Metadata**: What is this thing? (title, description, image)
- **Discovery Metadata**: How to find it? (keywords, categories, author)
- **Validation Metadata**: Can we trust it? (HTTP status, content type, freshness)

### Design Philosophy
- **Hybrid Structure**: Uniform core fields + type-specific extensions
- **Consumer-First**: Predictable structure for basic operations, rich data for specialized features
- **Graph-Optimized**: Clean mapping to GraphQL schema for The Graph indexing
- **Gas-Conscious**: Balance between data richness and on-chain costs

## Data Structure

### TypeScript Interface

```typescript
interface ETSTargetMetadata {
  // Core fields (always present for GraphQL queries)
  core: {
    uri: string;           // Original URI
    title: string;         // Page title or filename
    description: string;   // Meta description or empty string
    image: string | null;  // OG image or null
    favicon: string | null;// Site favicon
    httpStatus: number;    // 200, 404, 500, etc.
    contentType: string;   // text/html, image/jpeg, application/pdf, etc.
    language: string;      // en, es, fr, or 'unknown'
    extractedAt: string;   // ISO 8601 timestamp
    extractionMethod: string; // 'opengraph', 'json-ld', 'html', 'fallback'
  };

  // Content classification
  type: 'article' | 'video' | 'image' | 'document' | 'profile' | 'repository' | 'nft' | 'social_post' | 'unknown';

  // Platform identification (for specialized rendering)
  platform?: 'github' | 'youtube' | 'twitter' | 'farcaster' | 'lens' | 'medium' | 'wikipedia' | 'custom';

  // Keywords for searchability in The Graph
  keywords?: string[];

  // Simplified extensions (gas-conscious, Graph-friendly)
  extensions?: {
    // Author/creator info
    creator?: {
      name?: string;
      url?: string;
      handle?: string;     // @username
      verified?: boolean;  // Platform verification
    };

    // Temporal context
    dates?: {
      published?: string;  // ISO 8601
      modified?: string;   // ISO 8601
    };

    // Media info (for videos/images)
    media?: {
      duration?: number;   // seconds
      width?: number;      // pixels
      height?: number;     // pixels
      size?: number;       // bytes
      thumbnails?: string[]; // Additional preview images
    };

    // Metrics (platform-specific)
    metrics?: {
      views?: number;
      likes?: number;
      stars?: number;      // GitHub
      forks?: number;      // GitHub
      reposts?: number;    // Social media
      replies?: number;    // Social media
    };

    // Social media context
    context?: {
      isReply?: boolean;
      threadId?: string;
      quotedPost?: string;
      channel?: string;    // Farcaster channels
    };
  };
}
```

### Smart Contract Event

```solidity
// In IETSTarget.sol
event TargetEnriched(
    uint256 indexed targetId,
    address indexed enrichedBy,
    uint256 httpStatus,
    string contentType,
    string metadataJson  // Structured JSON matching ETSTargetMetadata interface
);
```

### The Graph Schema

```graphql
type TargetMetadata @entity {
  id: ID!
  target: Target!

  # Core fields (always queryable)
  uri: String!
  title: String!
  description: String!
  image: String
  favicon: String
  httpStatus: Int!
  contentType: String!
  language: String!
  extractedAt: BigInt!
  extractionMethod: String!

  # Classification
  type: MetadataType!
  platform: Platform
  keywords: [String!]

  # Extensions (nullable)
  creatorName: String
  creatorUrl: String
  creatorHandle: String
  creatorVerified: Boolean
  publishedDate: BigInt
  modifiedDate: BigInt
  mediaDuration: Int
  mediaWidth: Int
  mediaHeight: Int
  viewCount: BigInt
  likeCount: BigInt
  repostCount: BigInt

  # Timestamps
  enrichedAt: BigInt!
  enrichedBy: Bytes!
}

enum MetadataType {
  article
  video
  image
  document
  profile
  repository
  nft
  social_post
  unknown
}

enum Platform {
  github
  youtube
  twitter
  farcaster
  lens
  medium
  wikipedia
  custom
}
```

## Extraction Strategy

### 1. Content Type Router

```typescript
class MetadataExtractor {
  async extract(uri: string): Promise<ETSTargetMetadata> {
    const response = await fetch(uri);
    const contentType = response.headers.get('content-type');

    // Route to appropriate extractor
    if (contentType?.includes('text/html')) {
      return this.extractHTML(response);
    } else if (contentType?.includes('application/json')) {
      return this.extractJSON(response);
    } else if (contentType?.includes('image/')) {
      return this.extractImage(response);
    } else if (contentType?.includes('application/pdf')) {
      return this.extractPDF(response);
    } else if (contentType?.includes('video/')) {
      return this.extractVideo(response);
    } else {
      return this.extractFallback(response);
    }
  }
}
```

### 2. Metadata Standards Priority (for HTML)

1. **JSON-LD** (`application/ld+json`) - Most structured, preferred
2. **OpenGraph** (`og:*` meta tags) - Wide adoption, social media standard
3. **Twitter Cards** (`twitter:*` meta tags) - Twitter/X specific
4. **Schema.org** (microdata) - Semantic web standard
5. **Basic HTML** (title, meta description) - Fallback

### 3. Platform-Specific Handlers

```typescript
interface ContentHandler {
  canHandle(url: URL, contentType: string): boolean;
  extract(response: Response): Promise<ETSTargetMetadata>;
}

const handlers: ContentHandler[] = [
  // Social Media
  new TwitterHandler(),      // X/Twitter posts, profiles, spaces
  new FarcasterHandler(),    // Casts, channels, frames
  new LensHandler(),         // Publications, profiles

  // Development Platforms
  new GitHubHandler(),       // Repos, issues, PRs, gists
  new GitLabHandler(),       // Similar to GitHub

  // Media Platforms
  new YouTubeHandler(),      // Videos, channels, playlists
  new VimeoHandler(),        // Videos
  new SpotifyHandler(),      // Music, podcasts

  // Content Platforms
  new MediumHandler(),       // Articles
  new SubstackHandler(),     // Newsletters
  new WikipediaHandler(),    // Encyclopedia entries

  // Web3/Decentralized
  new IPFSHandler(),         // Distributed content
  new ArweaveHandler(),      // Permanent storage
  new ENSHandler(),          // Ethereum domains
  new NFTHandler(),          // Token metadata

  // Documents
  new PDFHandler(),          // PDF documents
  new MarkdownHandler(),     // .md files

  // Generic
  new HTMLHandler(),         // Generic websites
  new ImageHandler(),        // Direct image links
  new JSONAPIHandler(),      // REST APIs
];
```

## Implementation Phases

### Phase 1: MVP (Current)
- [ ] Core structure implementation
- [ ] HTML extraction with OpenGraph
- [ ] Basic fallback for non-OG sites
- [ ] Error handling for 404s, timeouts
- [ ] Test with 10 common URL types

### Phase 2: Social & Media
- [ ] Twitter/X post extraction
- [ ] Farcaster cast extraction
- [ ] YouTube video metadata
- [ ] GitHub repository data
- [ ] Image EXIF extraction

### Phase 3: Advanced
- [ ] JSON-LD parsing
- [ ] PDF text extraction
- [ ] Multi-language support
- [ ] Caching layer
- [ ] Rate limiting

### Phase 4: Web3
- [ ] IPFS content resolution
- [ ] Arweave retrieval
- [ ] ENS metadata
- [ ] NFT metadata standards
- [ ] Lens Protocol integration

## Testing Strategy

### URL Test Cases

```typescript
const testUrls = [
  // Valid URLs
  'https://github.com/ethereum/go-ethereum',        // GitHub repo
  'https://twitter.com/VitalikButerin/status/123',  // X post
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',    // YouTube video
  'https://medium.com/@user/article-title',         // Medium article
  'https://en.wikipedia.org/wiki/Ethereum',         // Wikipedia

  // Edge Cases
  'https://example.com/404',                        // 404 page
  'https://example.com/timeout',                    // Slow response
  'https://example.com/no-metadata',                // No OG tags
  'https://example.com/redirect',                   // 301/302 redirect
  'ipfs://Qm...',                                   // IPFS hash

  // Social Media
  'https://warpcast.com/vitalik.eth/0x123',        // Farcaster cast
  'https://lenster.xyz/posts/0x123',               // Lens post
  'https://twitter.com/spaces/123',                // Twitter Space

  // Direct Files
  'https://example.com/document.pdf',              // PDF
  'https://example.com/image.jpg',                 // Image
  'https://raw.github.com/user/repo/README.md',    // Markdown
];
```

## Consumer Usage Examples

### Basic Display
```typescript
// Always works with core fields
<TargetCard
  title={metadata.core.title}
  description={metadata.core.description}
  image={metadata.core.image}
  status={metadata.core.httpStatus}
/>
```

### Type-Specific Enhancement
```typescript
// Render based on type
switch(metadata.type) {
  case 'social_post':
    return <SocialPostCard metadata={metadata} />;
  case 'repository':
    return <RepoCard metadata={metadata} />;
  case 'video':
    return <VideoEmbed metadata={metadata} />;
  default:
    return <GenericCard metadata={metadata} />;
}
```

### GraphQL Queries
```graphql
# Find all GitHub repositories
query GitHubRepos {
  targetMetadatas(where: {
    type: repository,
    platform: github
  }) {
    title
    description
    creatorName
    metrics_stars
    metrics_forks
  }
}

# Find broken links
query BrokenLinks {
  targetMetadatas(where: {
    httpStatus_gte: 400
  }) {
    uri
    httpStatus
    target {
      id
      targetURI
    }
  }
}

# Find social posts with high engagement
query PopularPosts {
  targetMetadatas(
    where: {
      type: social_post,
      likeCount_gt: 1000
    }
    orderBy: likeCount
    orderDirection: desc
  ) {
    title
    description
    platform
    creatorHandle
    likeCount
    repostCount
  }
}
```

## Security Considerations

1. **URL Validation**: Sanitize and validate URLs before fetching
2. **Timeout Protection**: Set reasonable timeouts (5-10 seconds)
3. **Size Limits**: Cap response size to prevent memory exhaustion
4. **Rate Limiting**: Implement per-domain rate limits
5. **Content Filtering**: Skip binary content over certain size
6. **SSRF Prevention**: Block internal network addresses
7. **User-Agent**: Use identifiable user agent for transparency

## Performance Optimizations

1. **Caching**: Cache metadata for recently seen URLs (TTL: 1 hour for success, 5 min for failures)
2. **Parallel Processing**: Process multiple URLs concurrently in Temporal workflows
3. **Early Termination**: Stop parsing after finding sufficient metadata
4. **Streaming**: Use streaming parsers for large HTML documents
5. **CDN Detection**: Skip image extraction for known CDN patterns
6. **Batch Processing**: Group URLs by domain for connection reuse

## Future Enhancements

1. **AI-Powered Summarization**: Use LLMs to generate descriptions for content without metadata
2. **Screenshot Service**: Capture visual previews for better UX
3. **Translation**: Auto-translate metadata to user's language
4. **Sentiment Analysis**: Add sentiment scores for social posts
5. **Content Classification**: Auto-categorize based on content analysis
6. **Relationship Mapping**: Identify connections between tagged content
7. **Trend Detection**: Track metadata changes over time
8. **Quality Scoring**: Rate metadata completeness and reliability
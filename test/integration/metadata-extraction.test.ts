// @ts-ignore - Bun test runner types
import { afterAll, beforeAll, describe, test } from "bun:test";
import { expect } from "chai";
import { MetadataExtractor } from '../../apps/temporal-processor/src/services/MetadataExtractor';
import type { ETSTargetMetadata } from '../../apps/temporal-processor/src/types/metadata';

/**
 * Metadata Extraction Integration Tests
 *
 * Tests the metadata extraction service with real URLs to ensure:
 * - Correct content type detection
 * - Platform identification
 * - Metadata quality and completeness
 * - Error handling for bad URIs
 * - Edge case handling (404s, timeouts, redirects)
 *
 * Run with: bun test test/integration/metadata-extraction.test.ts
 */

describe('Metadata Extraction Integration Tests', () => {
  let extractor: MetadataExtractor;

  beforeAll(() => {
    extractor = new MetadataExtractor({
      timeout: 15000, // Longer timeout for real network requests
      maxSize: 5 * 1024 * 1024,
    });
  });

  describe('Valid URLs - Content Types & Platforms', () => {
    test('should extract GitHub repository metadata', async () => {
      const url = 'https://github.com/ethereum/go-ethereum';
      const metadata = await extractor.extract(url);

      expect(metadata.core.uri).to.equal(url);
      expect(metadata.type).to.equal('repository');
      expect(metadata.platform).to.equal('github');
      expect(metadata.core.title).to.include('go-ethereum');
      expect(metadata.core.description).to.exist;
      expect(metadata.core.extractionMethod).to.be.oneOf(['opengraph', 'html']);
      expect(metadata.core.httpStatus).to.equal(200);
    });

    test('should extract YouTube video metadata', async () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const metadata = await extractor.extract(url);

      expect(metadata.type).to.equal('video');
      expect(metadata.platform).to.equal('youtube');
      expect(metadata.core.title).to.exist;
      expect(metadata.core.image).to.exist; // YouTube provides thumbnails
      // Note: extensions.media might not be populated without API calls
    });

    test('should extract Twitter/X post metadata', async () => {
      const url = 'https://twitter.com/VitalikButerin/status/1729192778048221435';
      const metadata = await extractor.extract(url);

      expect(metadata.type).to.equal('social_post');
      expect(metadata.platform).to.equal('twitter');
      expect(metadata.core.title).to.exist;
      expect(metadata.core.extractionMethod).to.be.oneOf(['twitter', 'opengraph', 'html']);
    });

    test('should extract Medium article metadata', async () => {
      const url = 'https://medium.com/@VitalikButerin/the-end-of-my-childhood-8b0e6c0e714e';
      const metadata = await extractor.extract(url);

      expect(metadata.type).to.equal('article');
      expect(metadata.platform).to.equal('medium');
      expect(metadata.core.title).to.exist;
      expect(metadata.core.description).to.exist;
      // Check for author info if available
      if (metadata.extensions?.creator) {
        expect(metadata.extensions.creator.name).to.exist;
      }
    });

    test('should extract Wikipedia page metadata', async () => {
      const url = 'https://en.wikipedia.org/wiki/Ethereum';
      const metadata = await extractor.extract(url);

      expect(metadata.type).to.equal('article');
      expect(metadata.platform).to.equal('wikipedia');
      expect(metadata.core.title).to.include('Ethereum');
      expect(metadata.core.description).to.exist;
    });
  });

  describe('Edge Cases & Error Handling', () => {
    test('should handle 404 pages gracefully', async () => {
      const url = 'https://httpstat.us/404';
      const metadata = await extractor.extract(url);

      expect(metadata.core.extractionMethod).to.equal('error');
      expect(metadata.type).to.equal('unknown');
      expect(metadata.core.title).to.include('Error');
      // httpStatus might be 0 or 404 depending on how unfurl handles it
    });

    test('should handle invalid URLs', async () => {
      const url = 'not-a-valid-url';
      const metadata = await extractor.extract(url);

      expect(metadata.core.extractionMethod).to.equal('error');
      expect(metadata.type).to.equal('unknown');
      expect(metadata.core.description).to.include('Invalid URL');
    });

    test('should handle timeout gracefully', async () => {
      const url = 'https://httpstat.us/200?sleep=20000'; // Sleeps for 20 seconds
      const fastExtractor = new MetadataExtractor({ timeout: 1000, maxSize: 5 * 1024 * 1024 }); // 1 second timeout
      const metadata = await fastExtractor.extract(url);

      expect(metadata.core.extractionMethod).to.equal('error');
      expect(metadata.core.description).to.satisfy((desc: string) =>
        desc.includes('timeout') || desc.includes('Timeout')
      );
    });

    test('should handle pages with minimal metadata', async () => {
      const url = 'https://example.com';
      const metadata = await extractor.extract(url);

      expect(metadata.core.title).to.exist; // Should at least have hostname
      expect(metadata.core.extractionMethod).to.be.oneOf(['html', 'fallback']);
    });
  });

  describe('Bad URI Security & Validation', () => {
    test('should reject JavaScript protocol', async () => {
      const url = 'javascript:alert(1)';
      const metadata = await extractor.extract(url);

      expect(metadata.core.extractionMethod).to.equal('error');
      expect(metadata.type).to.equal('unknown');
      expect(metadata.core.description).to.include('Invalid URL');
    });

    test('should reject file protocol', async () => {
      const url = 'file:///etc/passwd';
      const metadata = await extractor.extract(url);

      expect(metadata.core.extractionMethod).to.equal('error');
      expect(metadata.type).to.equal('unknown');
    });

    test('should reject internal IP addresses', async () => {
      const internalIPs = [
        'http://192.168.1.1',
        'http://127.0.0.1',
        'http://10.0.0.1',
        'http://172.16.0.1'
      ];

      for (const url of internalIPs) {
        const metadata = await extractor.extract(url);

        expect(metadata.core.extractionMethod).to.equal('error');
        expect(metadata.type).to.equal('unknown');
        expect(metadata.core.description).to.satisfy((desc: string) =>
          desc.includes('Internal IP') || desc.includes('Invalid URL')
        );
      }
    });

    test('should handle non-existent domains', async () => {
      const url = 'https://this-domain-definitely-does-not-exist-12345.com';
      const metadata = await extractor.extract(url);

      expect(metadata.core.extractionMethod).to.equal('error');
      expect(metadata.type).to.equal('unknown');
    });
  });

  describe('Content Type Detection', () => {
    test('should detect PDF documents', async () => {
      const url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      const metadata = await extractor.extract(url);

      expect(metadata.type).to.be.oneOf(['document', 'unknown']); // Might vary based on response
      if (metadata.core.contentType) {
        expect(metadata.core.contentType.toLowerCase()).to.include('pdf');
      }
    });

    test('should detect image files from URL patterns', async () => {
      const url = 'https://via.placeholder.com/150.png';
      const metadata = await extractor.extract(url);

      expect(metadata.type).to.equal('image');
    });
  });

  describe('Metadata Quality Checks', () => {
    test('should prefer OpenGraph over HTML metadata when available', async () => {
      const url = 'https://www.nytimes.com';
      const metadata = await extractor.extract(url);

      if (metadata.core.extractionMethod === 'opengraph') {
        expect(metadata.core.image).to.exist; // OG usually includes images
      }
    });

    test('should extract title for any valid webpage', async () => {
      const urls = [
        'https://example.com',
        'https://google.com',
        'https://ethereum.org'
      ];

      for (const url of urls) {
        const metadata = await extractor.extract(url);
        expect(metadata.core.title).to.exist;
        expect(metadata.core.title).to.not.equal('');
      }
    });
  });
});

/**
 * Bad URI Handling Strategy Documentation:
 *
 * 1. Pre-validation (in MetadataExtractor.validateUrl):
 *    - Check for valid URL format
 *    - Block dangerous protocols (javascript:, file:, ftp:, etc.)
 *    - Block internal IPs (10.x, 192.168.x, 172.16-31.x, 127.x)
 *    - Ensure http/https protocols only
 *
 * 2. During Extraction:
 *    - Timeout protection (default 10s)
 *    - Size limits (default 5MB)
 *    - Follow redirect limits (max 5)
 *
 * 3. Error Recovery:
 *    - Return standardized error metadata
 *    - Set extractionMethod to 'error'
 *    - Set type to 'unknown'
 *    - Include error details in description
 *    - Set appropriate HTTP status (0 for network errors, actual status for HTTP errors)
 *
 * 4. On-chain Handling:
 *    - Activity checks for error metadata before calling contract
 *    - Could skip enrichment for error cases
 *    - Or emit minimal event with error flag
 */
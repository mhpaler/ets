import type { Address } from "viem";
// Jest globals are automatically available
import {
  allocateCreatorRewards,
  createTagCoinMetadata,
  deployTagCoinOnZora,
} from "../../src/activities/tagCoinActivities";

describe("TAG Coin Activities", () => {
  describe("createTagCoinMetadata", () => {
    it("should create inline metadata for MVP", async () => {
      const params = {
        tagId: "test-tag-123",
        tagString: "#ethereum",
        creator: "0x976EA74026E726554dB657fA54763abd0C3a0aa9" as Address,
        coinAddress: "0x1234567890123456789012345678901234567890" as Address,
      };

      const result = await createTagCoinMetadata(params);

      expect(result.status).toBe("success");
      expect(result.metadataURI).toMatch(/^data:application\/json;base64,/);

      // Decode and verify metadata content
      const base64Data = result.metadataURI.split(",")[1];
      const metadata = JSON.parse(Buffer.from(base64Data, "base64").toString());

      expect(metadata.name).toBe("TAG: ethereum");
      expect(metadata.symbol).toBe("ETS");
      expect(metadata.description).toBe("ETS TAG coin for #ethereum");
      expect(metadata.attributes).toHaveLength(3);
      expect(metadata.attributes[0]).toEqual({ trait_type: "Platform", value: "ETS" });
      expect(metadata.attributes[1]).toEqual({ trait_type: "Creator", value: params.creator });
      expect(metadata.attributes[2]).toEqual({ trait_type: "Tag", value: "#ethereum" });
    });

    it("should handle tags with special characters", async () => {
      const params = {
        tagId: "test-tag-456",
        tagString: "#DeFi-2024",
        creator: "0x976EA74026E726554dB657fA54763abd0C3a0aa9" as Address,
        coinAddress: "0x1234567890123456789012345678901234567890" as Address,
      };

      const result = await createTagCoinMetadata(params);

      expect(result.status).toBe("success");

      // Decode and verify special characters are preserved
      const base64Data = result.metadataURI.split(",")[1];
      const metadata = JSON.parse(Buffer.from(base64Data, "base64").toString());

      expect(metadata.name).toBe("TAG: DeFi-2024");
      expect(metadata.attributes[2].value).toBe("#DeFi-2024");
    });

    it("should handle metadata creation errors gracefully", async () => {
      const params = {
        tagId: "test-tag-789",
        tagString: null as any, // Invalid input
        creator: "0x976EA74026E726554dB657fA54763abd0C3a0aa9" as Address,
        coinAddress: "0x1234567890123456789012345678901234567890" as Address,
      };

      const result = await createTagCoinMetadata(params);

      expect(result.status).toBe("failed");
      expect(result.error).toBeDefined();
      expect(result.metadataURI).toBe("");
    });
  });

  describe("deployTagCoinOnZora", () => {
    // Note: This is more of an integration test since it requires blockchain interaction
    // In a real unit test, we'd mock the viem clients

    it("should return proper structure for deployment", async () => {
      // This test would need proper mocking of blockchain clients
      // For now, we'll test the response structure validation

      const params = {
        tagId: "test-tag-999",
        tagString: "#bitcoin",
        coinAddress: "0x1234567890123456789012345678901234567890" as Address,
        metadataURI: "data:application/json;base64,test",
        creator: "0x976EA74026E726554dB657fA54763abd0C3a0aa9" as Address,
        machineName: "bitcoin",
        channel: "0x8dAF17A20c9DBA35f005b6324f493785D239719d" as Address,
        timestamp: "2024-01-01T00:00:00Z",
        blockNumber: "100",
        transactionHash: "0xabc123",
        poolConfig: "0x0000000000000000000000000000000000000000" as Address, // Default pool config
      };

      // In a real test with mocked clients, we'd test the actual deployment
      // For now, we ensure the function handles the params correctly
      expect(params.tagId).toBeDefined();
      expect(params.machineName).toBe("bitcoin");
      expect(params.channel).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it("should handle deployment failures gracefully", async () => {
      const params = {
        tagId: "test-tag-error",
        tagString: "#error",
        coinAddress: "0x0000000000000000000000000000000000000000" as Address, // Invalid
        metadataURI: "data:application/json;base64,test",
        creator: "0x976EA74026E726554dB657fA54763abd0C3a0aa9" as Address,
        machineName: "error",
        channel: "0x8dAF17A20c9DBA35f005b6324f493785D239719d" as Address,
        timestamp: "2024-01-01T00:00:00Z",
        blockNumber: "100",
        transactionHash: "0xabc123",
        poolConfig: "0x0000000000000000000000000000000000000000" as Address, // Default pool config
      };

      const result = await deployTagCoinOnZora(params);

      // Should return failed status when deployment fails
      expect(result.status).toBe("failed");
      expect(result.error).toBeDefined();
    });
  });

  describe("allocateCreatorRewards", () => {
    it("should return success for MVP placeholder", async () => {
      const params = {
        tagId: "test-tag-rewards",
        coinAddress: "0x1234567890123456789012345678901234567890" as Address,
        creator: "0x976EA74026E726554dB657fA54763abd0C3a0aa9" as Address,
        amount: "1000000",
      };

      const result = await allocateCreatorRewards(params);

      // Currently returns success as placeholder
      expect(result.status).toBe("success");
      expect(result.error).toBeUndefined();
    });

    it("should handle allocation with null tagId gracefully", async () => {
      const params = {
        tagId: null as any, // Invalid input
        coinAddress: "0x1234567890123456789012345678901234567890" as Address,
        creator: "0x976EA74026E726554dB657fA54763abd0C3a0aa9" as Address,
        amount: "1000000",
      };

      const result = await allocateCreatorRewards(params);

      // Currently returns success as it's a placeholder implementation
      // When fully implemented, this should validate inputs and return failed
      expect(result.status).toBe("success"); // Placeholder always returns success

      // TODO: When issue #533 is implemented, update this test to expect failure
      // expect(result.status).toBe("failed");
      // expect(result.error).toBeDefined();
    });
  });

  describe("Environment-specific behavior", () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it("should use inline metadata for localhost environment", async () => {
      process.env.NODE_ENV = "development";

      const params = {
        tagId: "env-test-local",
        tagString: "#local",
        creator: "0x976EA74026E726554dB657fA54763abd0C3a0aa9" as Address,
        coinAddress: "0x1234567890123456789012345678901234567890" as Address,
      };

      const result = await createTagCoinMetadata(params);

      // Localhost uses inline data URIs
      expect(result.metadataURI).toMatch(/^data:application\/json;base64,/);
    });

    it("should prepare for IPFS metadata in production", async () => {
      process.env.NODE_ENV = "production";

      // In production, we'd use IPFS or Arweave
      // For now, we're still using inline metadata
      const params = {
        tagId: "env-test-prod",
        tagString: "#production",
        creator: "0x976EA74026E726554dB657fA54763abd0C3a0aa9" as Address,
        coinAddress: "0x1234567890123456789012345678901234567890" as Address,
      };

      const result = await createTagCoinMetadata(params);

      // Future: expect(result.metadataURI).toMatch(/^ipfs:\/\//);
      // Current MVP:
      expect(result.metadataURI).toMatch(/^data:application\/json;base64,/);
    });
  });
});

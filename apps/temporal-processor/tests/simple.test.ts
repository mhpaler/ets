// Simple test to verify basic Temporal workflow functionality
import type { TargetEnrichmentWorkflowInput } from "../src/types";
import { TargetEnrichmentWorkflow } from "../src/workflows";

describe("Basic Workflow Import Test", () => {
  it("should import workflow successfully", () => {
    expect(TargetEnrichmentWorkflow).toBeDefined();
    expect(typeof TargetEnrichmentWorkflow).toBe("function");
  });

  it("should have correct workflow input type", () => {
    const input: TargetEnrichmentWorkflowInput = {
      targetId: "test-123",
      targetURI: "https://example.com",
      transactionHash: "0xabc123" as any,
      blockNumber: "100",
      chainId: 31337,
      timestamp: new Date(),
    };

    expect(input.targetId).toBe("test-123");
    expect(input.chainId).toBe(31337);
    expect(input.targetURI).toBe("https://example.com");
  });

  it("should have activity files present", () => {
    // Test that the activity files exist without importing them
    // (importing them would require all dependencies to be available)
    const fs = require("node:fs");
    const path = require("node:path");

    const activitiesDir = path.join(__dirname, "../src/activities");
    expect(fs.existsSync(path.join(activitiesDir, "targetEnrichmentActivities.ts"))).toBe(true);
    expect(fs.existsSync(path.join(activitiesDir, "tagCoinActivities.ts"))).toBe(true);
    expect(fs.existsSync(path.join(activitiesDir, "index.ts"))).toBe(true);
  });
});

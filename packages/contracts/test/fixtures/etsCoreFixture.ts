import { loadIgnitionFixture } from "./ignitionFixture.js";

/**
 * Shared ETS Core fixture that provides common setup for all ETS core test files
 *
 * This fixture extends the basic ignition fixture with ETS-specific setup:
 * - Creates test tags via ETSRelayer
 * - Sets up test targets
 * - Provides common test data and addresses
 */
export async function loadETSCoreFixture() {
  const base = await loadIgnitionFixture();

  // Common test constants
  const tagstring1 = "#Love";
  const tagstring2 = "#Hate";
  const tagstring3 = "#Fear";
  const tagstring4 = "#Incredible";

  // Get tagging fee
  const taggingFee = await base.contracts.ETS.read.taggingFee();

  // Create tags via ETSRelayer. Creator is Creator.
  await base.contracts.ETSRelayer.write.getOrCreateTagIds([[tagstring1]], { account: base.accounts.Creator.account });
  const etsTag1 = await base.contracts.ETSToken.read.computeCoinAddress([tagstring1]);

  await base.contracts.ETSRelayer.write.getOrCreateTagIds([[tagstring2, tagstring3]], {
    account: base.accounts.Creator.account,
  });
  const etsTag2 = await base.contracts.ETSToken.read.computeCoinAddress([tagstring2]);
  const etsTag3 = await base.contracts.ETSToken.read.computeCoinAddress([tagstring3]);

  // Create another tag.
  await base.contracts.ETSRelayer.write.getOrCreateTagIds([[tagstring4]], { account: base.accounts.Creator.account });
  const userTag1 = await base.contracts.ETSToken.read.computeCoinAddress([tagstring4]);

  // Add a target to ETS.
  const targetURI = "https://google.com";
  await base.contracts.ETSTarget.write.getOrCreateTargetId([targetURI], { account: base.accounts.RandomOne.account });
  const targetId = await base.contracts.ETSTarget.read.computeTargetId([targetURI]);

  return {
    ...base,
    // Common test data
    tagStrings: {
      tagstring1,
      tagstring2,
      tagstring3,
      tagstring4,
    },
    tagAddresses: {
      etsTag1,
      etsTag2,
      etsTag3,
      userTag1,
    },
    testTarget: {
      targetURI,
      targetId,
    },
    taggingFee,
  };
}

export type ETSCoreFixture = Awaited<ReturnType<typeof loadETSCoreFixture>>;

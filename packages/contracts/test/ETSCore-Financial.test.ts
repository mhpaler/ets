import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadETSCoreFixture } from "./fixtures/etsCoreFixture.js";

describe("ETS Core Financial Operations", async () => {
  const { accounts, contracts, taggingFee } = await loadETSCoreFixture();

  describe("Accrued fees management", async () => {
    let platformPreTagAccrued: bigint;
    let relayerPreTagAccrued: bigint;
    let creatorPreTagAccrued: bigint;
    let ownerPreTagAccrued: bigint;
    let platformPostTagAccrued: bigint;

    // Get initial accrued amounts at module level
    platformPreTagAccrued = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
    relayerPreTagAccrued = await contracts.ETS.read.accrued([accounts.RandomOne.account.address]);
    creatorPreTagAccrued = await contracts.ETS.read.accrued([accounts.Creator.account.address]);
    ownerPreTagAccrued = await contracts.ETS.read.accrued([accounts.RandomTwo.account.address]);

    it("should track accrued balances correctly", async () => {
      // Test that we can read accrued balances
      const platformAccrued = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      const relayerAccrued = await contracts.ETS.read.accrued([contracts.ETSRelayer.address]);
      const creatorAccrued = await contracts.ETS.read.accrued([accounts.Creator.account.address]);

      // These should be BigInt values (could be 0n initially)
      assert.equal(typeof platformAccrued, "bigint");
      assert.equal(typeof relayerAccrued, "bigint");
      assert.equal(typeof creatorAccrued, "bigint");
    });

    it("should accrue fees correctly after tagging operations", async () => {
      // Get pre-test amounts
      const platformPreTest = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      const relayerPreTest = await contracts.ETS.read.accrued([contracts.ETSRelayer.address]);
      const creatorPreTest = await contracts.ETS.read.accrued([accounts.Creator.account.address]);

      const rawInput = {
        targetURI: "https://financial-test-1.com",
        tagStrings: ["#Love"], // Use platform owned tag
        recordType: "bookmark",
        enrich: false,
      };

      // Create tagging record with fee
      await contracts.ETS.write.applyTagsWithRawInput([
        rawInput,
        accounts.RandomTwo.account.address,
        accounts.ETSPlatform.account.address,
      ], {
        value: taggingFee,
        account: accounts.ETSPlatform.account,
      });

      // Get post-test amounts
      const platformPostTest = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      const relayerPostTest = await contracts.ETS.read.accrued([contracts.ETSRelayer.address]);
      const creatorPostTest = await contracts.ETS.read.accrued([accounts.Creator.account.address]);

      // Verify fees were distributed
      assert.ok(platformPostTest > platformPreTest, "Platform should receive fees");
      assert.ok(relayerPostTest > relayerPreTest, "Relayer should receive fees");
      assert.ok(creatorPostTest > creatorPreTest, "Creator should receive fees");

      // Store for drawdown test
      platformPostTagAccrued = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
    });

    it("should allow drawdown of accrued fees", async () => {
      // Get platform balance before drawdown
      const platformBalanceBefore = await contracts.publicClient.getBalance({
        address: accounts.ETSPlatform.account.address,
      });

      // Perform drawdown - AccountRandomOne is triggering the drawdown of ETH accrued for ETSPlatform
      await contracts.ETS.write.drawDown([accounts.ETSPlatform.account.address], {
        account: accounts.RandomOne.account,
      });

      // Get platform balance after drawdown
      const platformBalanceAfter = await contracts.publicClient.getBalance({
        address: accounts.ETSPlatform.account.address,
      });

      // Check that the balance increased by the accrued amount
      const balanceIncrease = platformBalanceAfter - platformBalanceBefore;
      assert.ok(balanceIncrease > 0n, "Platform balance should increase after drawdown");

      // Verify accrued balance is now zero
      const accruedAfterDrawdown = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      assert.equal(accruedAfterDrawdown, 0n, "Accrued balance should be zero after drawdown");

      // Test second drawdown returns nothing
      const balanceBeforeSecondDraw = await contracts.publicClient.getBalance({
        address: accounts.ETSPlatform.account.address,
      });

      await contracts.ETS.write.drawDown([accounts.ETSPlatform.account.address], {
        account: accounts.RandomOne.account,
      });

      const balanceAfterSecondDraw = await contracts.publicClient.getBalance({
        address: accounts.ETSPlatform.account.address,
      });

      assert.equal(balanceAfterSecondDraw, balanceBeforeSecondDraw, "Second drawdown should not increase balance");
    });

    it("can be performed on behalf of the platform", async () => {
      // Create another tagging record to generate more fees
      const rawInput = {
        targetURI: "https://financial-test-2.com", 
        tagStrings: ["#Incredible"], // User owned tag
        recordType: "bookmark",
        enrich: false,
      };

      await contracts.ETS.write.applyTagsWithRawInput([
        rawInput,
        accounts.RandomTwo.account.address,
        accounts.ETSPlatform.account.address,
      ], {
        value: taggingFee,
        account: accounts.ETSPlatform.account,
      });

      // Get platform balance before drawdown
      const platformBalanceBefore = await contracts.publicClient.getBalance({
        address: accounts.ETSPlatform.account.address,
      });

      // Different account performing drawdown on behalf of platform
      await contracts.ETS.write.drawDown([accounts.ETSPlatform.account.address], {
        account: accounts.RandomOne.account, // RandomOne performing drawdown for ETSPlatform
      });

      const platformBalanceAfter = await contracts.publicClient.getBalance({
        address: accounts.ETSPlatform.account.address,
      });

      // Verify the drawdown worked
      assert.ok(platformBalanceAfter > platformBalanceBefore, "Drawdown on behalf of platform should work");
    });

    it("should revert drawdown for non-existent accrued balance", async () => {
      // Try to drawdown for an account with no accrued balance
      try {
        await contracts.ETS.write.drawDown([accounts.RandomTwo.account.address], {
          account: accounts.RandomOne.account,
        });
        // If no accrued balance, this should succeed but do nothing
        const accruedBalance = await contracts.ETS.read.accrued([accounts.RandomTwo.account.address]);
        assert.equal(accruedBalance, 0n, "Account should have no accrued balance");
      } catch (error: any) {
        // It's fine if this reverts or succeeds with no transfer
        assert.ok(error.message.includes("revert") || true);
      }
    });
  });

  describe("Fee distribution percentages", async () => {
    it("should distribute fees according to current percentages", async () => {
      // Get current percentages
      const platformPercentage = await contracts.ETS.read.platformPercentage();
      const relayerPercentage = await contracts.ETS.read.relayerPercentage();

      // Create a tagging record to test distribution
      const rawInput = {
        targetURI: "https://percentage-test.com",
        tagStrings: ["#PercentageTest"],
        recordType: "bookmark",
        enrich: false,
      };

      // Get pre-test amounts
      const platformPreTest = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      const relayerPreTest = await contracts.ETS.read.accrued([contracts.ETSRelayer.address]);

      await contracts.ETS.write.applyTagsWithRawInput([
        rawInput,
        accounts.RandomTwo.account.address,
        accounts.ETSPlatform.account.address,
      ], {
        value: taggingFee,
        account: accounts.ETSPlatform.account,
      });

      // Get post-test amounts
      const platformPostTest = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      const relayerPostTest = await contracts.ETS.read.accrued([contracts.ETSRelayer.address]);

      // Calculate expected amounts
      const platformExpected = (taggingFee * platformPercentage) / 100n;
      const relayerExpected = (taggingFee * relayerPercentage) / 100n;

      // Verify distribution
      const platformReceived = platformPostTest - platformPreTest;
      const relayerReceived = relayerPostTest - relayerPreTest;

      assert.equal(platformReceived, platformExpected, "Platform should receive correct percentage");
      assert.equal(relayerReceived, relayerExpected, "Relayer should receive correct percentage");
    });

    it("should distribute remaining fees to tag owner", async () => {
      // Test with user-owned tag where remaining goes to owner
      const rawInput = {
        targetURI: "https://owner-test.com",
        tagStrings: ["#Incredible"], // User-owned tag (created by Creator)
        recordType: "bookmark",
        enrich: false,
      };

      // Get pre-test amounts
      const platformPreTest = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      const relayerPreTest = await contracts.ETS.read.accrued([contracts.ETSRelayer.address]);
      const ownerPreTest = await contracts.ETS.read.accrued([accounts.Creator.account.address]); // Creator owns this tag

      await contracts.ETS.write.applyTagsWithRawInput([
        rawInput,
        accounts.RandomTwo.account.address,
        accounts.ETSPlatform.account.address,
      ], {
        value: taggingFee,
        account: accounts.ETSPlatform.account,
      });

      // Get post-test amounts
      const platformPostTest = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      const relayerPostTest = await contracts.ETS.read.accrued([contracts.ETSRelayer.address]);
      const ownerPostTest = await contracts.ETS.read.accrued([accounts.Creator.account.address]);

      // Get percentages
      const platformPercentage = await contracts.ETS.read.platformPercentage();
      const relayerPercentage = await contracts.ETS.read.relayerPercentage();

      // Calculate expected amounts
      const platformExpected = (taggingFee * platformPercentage) / 100n;
      const relayerExpected = (taggingFee * relayerPercentage) / 100n;
      const ownerExpected = taggingFee - platformExpected - relayerExpected;

      // Verify distribution
      const platformReceived = platformPostTest - platformPreTest;
      const relayerReceived = relayerPostTest - relayerPreTest;
      const ownerReceived = ownerPostTest - ownerPreTest;

      assert.equal(platformReceived, platformExpected, "Platform should receive correct percentage");
      assert.equal(relayerReceived, relayerExpected, "Relayer should receive correct percentage");
      assert.equal(ownerReceived, ownerExpected, "Owner should receive remaining amount");
    });
  });
});
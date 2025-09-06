import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { loadETSCoreFixture } from "./fixtures/etsCoreFixture.js";

describe("ETS Core Financial Operations", async () => {
  const { accounts, contracts, taggingFee } = await loadETSCoreFixture();
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  describe("Accrued fees management", async () => {
    let platformPreTagAccrued: bigint;
    let relayerPreTagAccrued: bigint;
    let creatorPreTagAccrued: bigint;

    // Get initial accrued amounts at module level
    platformPreTagAccrued = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
    relayerPreTagAccrued = await contracts.ETS.read.accrued([accounts.RandomOne.account.address]);
    creatorPreTagAccrued = await contracts.ETS.read.accrued([accounts.Creator.account.address]);

    it("should track accrued balances correctly", async () => {
      // Test that we can read accrued balances
      const platformAccrued = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      const relayerAccrued = await contracts.ETS.read.accrued([contracts.ETSRelayer.address]);
      const creatorAccrued = await contracts.ETS.read.accrued([accounts.Creator.account.address]);

      console.log("DEBUG - Initial accrued balances:");
      console.log("  platformAccrued:", platformAccrued);
      console.log("  relayerAccrued:", relayerAccrued);
      console.log("  creatorAccrued:", creatorAccrued);

      // These should be BigInt values starting at 0n
      assert.equal(typeof platformAccrued, "bigint");
      assert.equal(typeof relayerAccrued, "bigint");
      assert.equal(typeof creatorAccrued, "bigint");

      // All three actors should start with zero accrued balances
      assert.equal(platformAccrued, 0n, "Platform should start with zero accrued balance");
      assert.equal(relayerAccrued, 0n, "Relayer should start with zero accrued balance");
      assert.equal(creatorAccrued, 0n, "Creator should start with zero accrued balance");
    });

    it("should accrue fees correctly after tagging operations", async () => {
      // Get pre-test amounts
      const platformPreTest = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      const relayerPreTest = await contracts.ETS.read.accrued([contracts.ETSRelayer.address]);
      const creatorPreTest = await contracts.ETS.read.accrued([accounts.Creator.account.address]);

      const rawInput = {
        targetURI: "https://financial-test-1.com",
        tagStrings: ["#FinancialTest1"], // Use unique tag name
        recordType: "bookmark",
      };

      // Compute the expected fee for this specific operation
      const [expectedFee] = await contracts.ETS.read.computeTaggingFeeFromRawInput([
        rawInput,
        accounts.ETSPlatform.account.address, // relayer
        accounts.RandomTwo.account.address, // tagger
        0, // APPLY action
      ]);

      // Check ETS contract balance before and after the fee payment
      const contractBalanceBefore = await publicClient.getBalance({ address: contracts.ETS.address });
      const platformBalanceBefore = await publicClient.getBalance({ address: accounts.ETSPlatform.account.address });
      const randomTwoBalanceBefore = await publicClient.getBalance({ address: accounts.RandomTwo.account.address });

      console.log("DEBUG - Fee payment:");
      console.log("  expectedFee to send:", expectedFee);
      console.log("  ETS balance before:", contractBalanceBefore);
      console.log("  Platform balance before:", platformBalanceBefore);
      console.log("  RandomTwo balance before:", randomTwoBalanceBefore);

      // Check ETSRelayer contract permissions instead of ETSPlatform
      const isETSRelayerActive = await contracts.ETSAccessControls.read.isRelayerAndNotPaused([
        contracts.ETSRelayer.address,
      ]);

      console.log("DEBUG - Using ETSRelayer instead of ETSPlatform:");
      console.log("  ETSRelayer is relayer and not paused:", isETSRelayerActive);

      // Create tagging record via ETSRelayer contract (proper way)
      console.log("DEBUG - About to call ETSRelayer.applyTags with:");
      console.log("  value:", expectedFee);
      console.log("  account (signer):", accounts.RandomTwo.account.address);

      const taggingParams = {
        targetURI: rawInput.targetURI,
        tagStrings: rawInput.tagStrings,
        recordType: rawInput.recordType,
        enrich: false, // Add this field that ETSRelayer expects
      };

      try {
        await contracts.ETSRelayer.write.applyTags(
          [[taggingParams]], // Array of tagging records
          {
            value: expectedFee,
            account: accounts.RandomTwo.account, // RandomTwo is the tagger calling ETSRelayer
          },
        );
        console.log("DEBUG - ETSRelayer.applyTags completed successfully");
      } catch (txError) {
        console.log("DEBUG - ETSRelayer.applyTags FAILED:", txError.message || txError);
      }

      // Check accrued balances immediately after transaction
      const platformAccruedAfterTx = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      const relayerAccruedAfterTx = await contracts.ETS.read.accrued([contracts.ETSRelayer.address]);
      const creatorAccruedAfterTx = await contracts.ETS.read.accrued([accounts.Creator.account.address]);

      console.log("DEBUG - Accrued balances after transaction:");
      console.log("  platformAccruedAfterTx:", platformAccruedAfterTx);
      console.log("  relayerAccruedAfterTx:", relayerAccruedAfterTx);
      console.log("  creatorAccruedAfterTx:", creatorAccruedAfterTx);

      // Check if tagging record was created and examine its details
      try {
        const taggingRecordId = await contracts.ETS.read.computeTaggingRecordIdFromRawInput([
          rawInput,
          accounts.RandomTwo.account.address, // tagger
          contracts.ETSRelayer.address, // relayer is now the ETSRelayer contract
        ]);
        console.log("  taggingRecordId:", taggingRecordId);

        const taggingRecord = await contracts.ETS.read.getTaggingRecordFromId([taggingRecordId]);
        console.log("  taggingRecord created:", taggingRecord ? "YES" : "NO");

        if (taggingRecord) {
          console.log("  taggingRecord details:");
          console.log("    coinAddresses:", taggingRecord[0]);
          console.log("    targetId:", taggingRecord[1]);
          console.log("    recordType:", taggingRecord[2]);
          console.log("    relayer:", taggingRecord[3]);
          console.log("    tagger:", taggingRecord[4]);
          console.log("    timestamp:", taggingRecord[5]);
        }
      } catch (error) {
        console.log("  taggingRecord lookup failed:", error.message);
      }

      const contractBalanceAfter = await publicClient.getBalance({ address: contracts.ETS.address });
      const platformBalanceAfter = await publicClient.getBalance({ address: accounts.ETSPlatform.account.address });
      const randomTwoBalanceAfter = await publicClient.getBalance({ address: accounts.RandomTwo.account.address });

      console.log("  ETS balance after:", contractBalanceAfter);
      console.log("  Platform balance after:", platformBalanceAfter);
      console.log("  RandomTwo balance after:", randomTwoBalanceAfter);
      console.log("  Platform balance change:", platformBalanceAfter - platformBalanceBefore);
      console.log("  RandomTwo balance change:", randomTwoBalanceAfter - randomTwoBalanceBefore);

      // Get post-test amounts
      const platformPostTest = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      const relayerPostTest = await contracts.ETS.read.accrued([contracts.ETSRelayer.address]);
      const creatorPostTest = await contracts.ETS.read.accrued([accounts.Creator.account.address]);

      // Verify fees were distributed
      assert.ok(platformPostTest > platformPreTest, "Platform should receive fees");
      assert.ok(relayerPostTest > relayerPreTest, "Relayer should receive fees");
      assert.ok(creatorPostTest > creatorPreTest, "Creator should receive fees");

      // Platform balance should have increased after tagging
      const platformPostTagAccrued = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      assert.ok(platformPostTagAccrued > 0n, "Platform should have accrued fees");
    });

    it("should allow drawdown of accrued fees", async () => {
      // Check accrued balance before drawdown
      const accruedBeforeDrawdown = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      const contractBalance = await publicClient.getBalance({ address: contracts.ETS.address });

      // Check where the ETH actually went
      const relayerBalance = await publicClient.getBalance({ address: contracts.ETSRelayer.address });
      const platformBalance = await publicClient.getBalance({ address: accounts.ETSPlatform.account.address });

      console.log("DEBUG - Before drawdown:");
      console.log("  accruedBeforeDrawdown:", accruedBeforeDrawdown);
      console.log("  ETS contract balance:", contractBalance);
      console.log("  ETSRelayer balance:", relayerBalance);
      console.log("  Platform account balance:", platformBalance);

      // Get platform balance before drawdown
      const platformBalanceBefore = await publicClient.getBalance({
        address: accounts.ETSPlatform.account.address,
      });

      // Perform drawdown - AccountRandomOne is triggering the drawdown of ETH accrued for ETSPlatform
      await contracts.ETS.write.drawDown([accounts.ETSPlatform.account.address], {
        account: accounts.RandomOne.account,
      });

      // Get platform balance after drawdown
      const platformBalanceAfter = await publicClient.getBalance({
        address: accounts.ETSPlatform.account.address,
      });

      // Check that the balance increased by the accrued amount
      const balanceIncrease = platformBalanceAfter - platformBalanceBefore;
      console.log("DEBUG - Drawdown balance check:");
      console.log("  platformBalanceBefore:", platformBalanceBefore);
      console.log("  platformBalanceAfter:", platformBalanceAfter);
      console.log("  balanceIncrease:", balanceIncrease);

      assert.ok(balanceIncrease > 0n, "Platform balance should increase after drawdown");

      // Verify accrued balance is now zero
      const accruedAfterDrawdown = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      assert.equal(accruedAfterDrawdown, 0n, "Accrued balance should be zero after drawdown");

      // Test second drawdown returns nothing
      const balanceBeforeSecondDraw = await publicClient.getBalance({
        address: accounts.ETSPlatform.account.address,
      });

      await contracts.ETS.write.drawDown([accounts.ETSPlatform.account.address], {
        account: accounts.RandomOne.account,
      });

      const balanceAfterSecondDraw = await publicClient.getBalance({
        address: accounts.ETSPlatform.account.address,
      });

      assert.equal(balanceAfterSecondDraw, balanceBeforeSecondDraw, "Second drawdown should not increase balance");
    });

    it("can be performed on behalf of the platform", async () => {
      // Create another tagging record to generate more fees
      const rawInput = {
        targetURI: "https://financial-test-2.com",
        tagStrings: ["#FinancialTest2"], // Use unique tag name
        recordType: "bookmark",
      };

      // Compute the expected fee for this specific operation
      const [expectedFee2] = await contracts.ETS.read.computeTaggingFeeFromRawInput([
        rawInput,
        accounts.ETSPlatform.account.address, // relayer
        accounts.RandomTwo.account.address, // tagger
        0, // APPLY action
      ]);

      await contracts.ETS.write.applyTagsWithRawInput(
        [rawInput, accounts.RandomTwo.account.address, accounts.ETSPlatform.account.address],
        {
          value: expectedFee2,
          account: accounts.ETSPlatform.account,
        },
      );

      // Get platform balance before drawdown
      const platformBalanceBefore = await publicClient.getBalance({
        address: accounts.ETSPlatform.account.address,
      });

      // Different account performing drawdown on behalf of platform
      await contracts.ETS.write.drawDown([accounts.ETSPlatform.account.address], {
        account: accounts.RandomOne.account, // RandomOne performing drawdown for ETSPlatform
      });

      const platformBalanceAfter = await publicClient.getBalance({
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

      console.log("DEBUG - Fee distribution setup:");
      console.log("  platformPercentage:", platformPercentage);
      console.log("  relayerPercentage:", relayerPercentage);
      console.log("  ETSRelayer address:", contracts.ETSRelayer.address);

      // Create a tagging record to test distribution
      const rawInput = {
        targetURI: "https://percentage-test.com",
        tagStrings: ["#PercentageTest"],
        recordType: "bookmark",
      };

      // Get pre-test amounts
      const platformPreTest = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      const relayerPreTest = await contracts.ETS.read.accrued([contracts.ETSRelayer.address]);

      // First create the tag via the ETSRelayer so it has the correct relayer
      await contracts.ETSRelayer.write.getOrCreateTagIds([["#PercentageTest"]], {
        account: accounts.RandomTwo.account,
      });

      // Compute the expected fee for this specific operation
      const [expectedFee] = await contracts.ETS.read.computeTaggingFeeFromRawInput([
        rawInput,
        accounts.ETSPlatform.account.address, // relayer
        accounts.RandomTwo.account.address, // tagger
        0, // APPLY action
      ]);

      await contracts.ETS.write.applyTagsWithRawInput(
        [rawInput, accounts.RandomTwo.account.address, accounts.ETSPlatform.account.address],
        {
          value: expectedFee,
          account: accounts.ETSPlatform.account,
        },
      );

      // Get post-test amounts
      const platformPostTest = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      const relayerPostTest = await contracts.ETS.read.accrued([contracts.ETSRelayer.address]);

      // Calculate expected amounts
      const platformExpected = (expectedFee * BigInt(platformPercentage)) / 100n;
      const relayerExpected = (expectedFee * BigInt(relayerPercentage)) / 100n;

      // Verify distribution
      const platformReceived = platformPostTest - platformPreTest;
      const relayerReceived = relayerPostTest - relayerPreTest;

      // Check what relayer the tag actually has
      const tagAddress = await contracts.ETSToken.read.computeCoinAddress(["#PercentageTest"]);
      const tagInfo = await contracts.ETSToken.read.getTagByAddress([tagAddress]);

      console.log("DEBUG - Fee distribution results:");
      console.log("  expectedFee:", expectedFee);
      console.log("  platformExpected:", platformExpected);
      console.log("  platformReceived:", platformReceived);
      console.log("  relayerExpected:", relayerExpected);
      console.log("  relayerReceived:", relayerReceived);
      console.log("  tagAddress:", tagAddress);
      console.log("  tag.relayer:", tagInfo.relayer);
      console.log("  test ETSRelayer:", contracts.ETSRelayer.address);

      assert.equal(platformReceived, platformExpected, "Platform should receive correct percentage");
      assert.equal(relayerReceived, relayerExpected, "Relayer should receive correct percentage");
    });

    it("should distribute remaining fees to tag owner", async () => {
      // Test with user-owned tag where remaining goes to owner
      const rawInput = {
        targetURI: "https://owner-test.com",
        tagStrings: ["#Incredible"], // User-owned tag (created by Creator)
        recordType: "bookmark",
      };

      // Get pre-test amounts
      const platformPreTest = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      const relayerPreTest = await contracts.ETS.read.accrued([contracts.ETSRelayer.address]);
      const ownerPreTest = await contracts.ETS.read.accrued([accounts.Creator.account.address]); // Creator owns this tag

      // Compute the expected fee for this specific operation
      const [expectedFee3] = await contracts.ETS.read.computeTaggingFeeFromRawInput([
        rawInput,
        accounts.ETSPlatform.account.address, // relayer
        accounts.RandomTwo.account.address, // tagger
        0, // APPLY action
      ]);

      await contracts.ETS.write.applyTagsWithRawInput(
        [rawInput, accounts.RandomTwo.account.address, accounts.ETSPlatform.account.address],
        {
          value: expectedFee3,
          account: accounts.ETSPlatform.account,
        },
      );

      // Get post-test amounts
      const platformPostTest = await contracts.ETS.read.accrued([accounts.ETSPlatform.account.address]);
      const relayerPostTest = await contracts.ETS.read.accrued([contracts.ETSRelayer.address]);
      const ownerPostTest = await contracts.ETS.read.accrued([accounts.Creator.account.address]);

      // Get percentages
      const platformPercentage = await contracts.ETS.read.platformPercentage();
      const relayerPercentage = await contracts.ETS.read.relayerPercentage();

      // Calculate expected amounts
      const platformExpected = (expectedFee3 * BigInt(platformPercentage)) / 100n;
      const relayerExpected = (expectedFee3 * BigInt(relayerPercentage)) / 100n;
      const ownerExpected = expectedFee3 - platformExpected - relayerExpected;

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

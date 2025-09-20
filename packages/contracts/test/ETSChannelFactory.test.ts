import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { keccak256, toBytes } from "viem";
import { loadETSCoreFixture } from "./fixtures/etsCoreFixture.js";

describe("ETSChannelFactory Tests", async () => {
  const { accounts, contracts } = await loadETSCoreFixture();

  // Variables that will be initialized per test
  // Note: tokenId variables removed since tag ownership tests were removed

  describe("Valid setup/initialization", async () => {
    it("sets CHANNEL_ADMIN_ROLE as the role that can administer CHANNEL_ROLE role.", async () => {
      const roleAdmin = await contracts.ETSAccessControls.read.getRoleAdmin([keccak256(toBytes("CHANNEL_ROLE"))]);
      const expectedRole = keccak256(toBytes("CHANNEL_FACTORY_ROLE"));
      assert.equal(roleAdmin, expectedRole);
    });

    it("Enables ETSChannelFactory as a channel factory.", async () => {
      const isFactory = await contracts.ETSAccessControls.read.isChannelFactory([contracts.ETSChannelFactory.address]);
      assert.equal(isFactory, true);
    });
  });

  describe("New channels", async () => {
    it("can only be added by if factory has correct role.", async () => {
      await contracts.ETSAccessControls.write.revokeRole(
        [keccak256(toBytes("CHANNEL_FACTORY_ROLE")), contracts.ETSChannelFactory.address],
        { account: accounts.ETSPlatform.account },
      );

      try {
        await contracts.ETSChannelFactory.write.addChannel(["UniswapTest1"], { account: accounts.User2.account });
        assert.fail("Expected transaction to revert");
      } catch (error) {
        assert.ok(error, "Transaction should have reverted");
      }

      await contracts.ETSAccessControls.write.grantRole(
        [keccak256(toBytes("CHANNEL_FACTORY_ROLE")), contracts.ETSChannelFactory.address],
        { account: accounts.ETSPlatform.account },
      );

      await contracts.ETSChannelFactory.write.addChannel(["UniswapTest1"], { account: accounts.User2.account });
      // TODO: Event testing needs to be implemented with viem
    });

    // Test removed: Channel creation is now democratized - no tag ownership required

    // Test removed: Channel creation is now democratized - no tag ownership or transfers required

    it("will revert if sender already owns channel", async () => {
      await contracts.ETSChannelFactory.write.addChannel(["UniswapTest2"], { account: accounts.User3.account });

      try {
        await contracts.ETSChannelFactory.write.addChannel(["SolanaTest2"], { account: accounts.User3.account });
        assert.fail("Expected transaction to revert with SenderOwnsChannel");
      } catch (error: any) {
        assert.ok(error.message.includes("SenderOwnsChannel"), "Should revert with SenderOwnsChannel error");
      }
    });

    it("will revert if name is too short", async () => {
      try {
        await contracts.ETSChannelFactory.write.addChannel(["X"], { account: accounts.User2.account });
        assert.fail("Expected transaction to revert with ChannelNameTooShort");
      } catch (error: any) {
        assert.ok(error.message.includes("ChannelNameTooShort"), "Should revert with ChannelNameTooShort error");
      }
    });

    it("will revert if name is too long", async () => {
      const longName = "this is a channel name that is well well well well over the limit in length";
      try {
        await contracts.ETSChannelFactory.write.addChannel([longName], { account: accounts.User2.account });
        assert.fail("Expected transaction to revert with ChannelNameTooLong");
      } catch (error: any) {
        assert.ok(error.message.includes("ChannelNameTooLong"), "Should revert with ChannelNameTooLong error");
      }
    });

    it("will revert if name already exists", async () => {
      await contracts.ETSChannelFactory.write.addChannel(["UniswapTest5"], { account: accounts.User4.account });

      try {
        await contracts.ETSChannelFactory.write.addChannel(["UniswapTest5"], { account: accounts.User1.account });
        assert.fail("Expected transaction to revert with ChannelNameExists");
      } catch (error: any) {
        assert.ok(error.message.includes("ChannelNameExists"), "Should revert with ChannelNameExists error");
      }
    });

    it("will emit ChannelAdded", async () => {
      await contracts.ETSChannelFactory.write.addChannel(["UniswapTest6"], {
        account: accounts.ETSEventProcessor.account,
      });
      // TODO: Event testing needs to be implemented with viem
    });

    it("can add multiple channels if sender is platform", async () => {
      await contracts.ETSChannelFactory.write.addChannel(["UniswapTest7"], { account: accounts.ETSPlatform.account });
      // TODO: Event testing needs to be implemented with viem
      await contracts.ETSChannelFactory.write.addChannel(["SolanaTest7"], { account: accounts.ETSPlatform.account });
      // TODO: Event testing needs to be implemented with viem
    });

    it("are not paused when added", async () => {
      await contracts.ETSChannelFactory.write.addChannel(["UniswapTest8"], { account: accounts.ETSAdmin.account });
      const channelAddress = await contracts.ETSAccessControls.read.getChannelAddressFromName(["UniswapTest8"]);
      const isNotPaused = await contracts.ETSAccessControls.read.isChannelAndNotPaused([channelAddress]);
      assert.equal(isNotPaused, true);
    });
  });

  describe("Active channel contracts", async () => {
    it("can be looked up by address", async () => {
      // Reuse the channel created by ETSEventProcessor in the previous test
      const channelAddress = await contracts.ETSAccessControls.read.getChannelAddressFromName(["UniswapTest6"]);

      const isChannelByAddress = await contracts.ETSAccessControls.read.isChannelByAddress([channelAddress]);
      const isChannel = await contracts.ETSAccessControls.read.isChannel([channelAddress]);
      assert.equal(isChannelByAddress, true);
      assert.equal(isChannel, true);
    });

    it("can be looked up by name", async () => {
      // Reuse the channel created by ETSAdmin in the "are not paused when added" test
      const isChannelByName = await contracts.ETSAccessControls.read.isChannelByName(["UniswapTest8"]);
      assert.equal(isChannelByName, true);
    });

    it("can be locked/unlocked by Platform", async () => {
      // Reuse the channel created by User4 in the "will revert if name already exists" test
      const channelAddress = await contracts.ETSAccessControls.read.getChannelAddressFromName(["UniswapTest5"]);

      // Try pausing by non-administrator account.
      try {
        await contracts.ETSAccessControls.write.toggleChannelLock([channelAddress], {
          account: accounts.User4.account,
        });
        assert.fail("Expected transaction to revert");
      } catch (error) {
        assert.ok(error, "Transaction should have reverted");
      }

      await contracts.ETSAccessControls.write.toggleChannelLock([channelAddress], {
        account: accounts.ETSPlatform.account,
      });
      // TODO: Event testing needs to be implemented with viem

      const isLocked = await contracts.ETSAccessControls.read.isChannelLocked([channelAddress]);
      assert.equal(isLocked, true);

      await contracts.ETSAccessControls.write.toggleChannelLock([channelAddress], {
        account: accounts.ETSPlatform.account,
      });
      const isUnlocked = await contracts.ETSAccessControls.read.isChannelLocked([channelAddress]);
      assert.equal(isUnlocked, false);
    });

    it("are paused by Platform if channel is transferred to new owner with no CTAGS", async () => {
      // TODO
      //
    });

    it("cannot be paused by non-owner or non-channel admin", async () => {
      // Reuse the channel created by ETSAdmin in the "are not paused when added" test
      const channelAddress = await contracts.ETSAccessControls.read.getChannelAddressFromName(["UniswapTest8"]);

      // Get ETSChannel contract instance
      const { viem } = await network.connect();
      const nonOwnerChannel = await viem.getContractAt("ETSChannel", channelAddress);

      // Try pausing as non-owner (eg. RandomTwo)
      try {
        await nonOwnerChannel.write.pause([], { account: accounts.User3.account });
        assert.fail("Expected transaction to revert with CallerNotChannelAdmin");
      } catch (error: any) {
        assert.ok(error.message.includes("CallerNotChannelAdmin"), "Should revert with CallerNotChannelAdmin error");
      }
    });

    it("can be paused & unpaused by Owner", async () => {
      // Use the pre-deployed ETSChannel from the fixture instead of trying to create a new one
      const uniswapChannel = contracts.ETSChannel;

      const isPaused1 = await uniswapChannel.read.paused([]);
      const isPaused2 = await uniswapChannel.read.isPaused([]);
      assert.equal(isPaused1, false);
      assert.equal(isPaused2, false);

      // Pause as the owner (ETSPlatform owns the channel)
      await uniswapChannel.write.pause([], { account: accounts.ETSPlatform.account });
      // TODO: Event testing needs to be implemented with viem

      await uniswapChannel.write.unpause([], { account: accounts.ETSPlatform.account });
      // TODO: Event testing needs to be implemented with viem
    });

    it("can be paused & unpaused by Platform (Channel Admin)", async () => {
      // Use the pre-deployed ETSChannel from the fixture
      const uniswapChannel = contracts.ETSChannel;

      const isPaused1 = await uniswapChannel.read.paused([]);
      const isPaused2 = await uniswapChannel.read.isPaused([]);
      assert.equal(isPaused1, false);
      assert.equal(isPaused2, false);

      // Now pause as the platform (ETSPlatform should have admin privileges)
      await uniswapChannel.write.pause([], { account: accounts.ETSPlatform.account });
      // TODO: Event testing needs to be implemented with viem

      await uniswapChannel.write.unpause([], { account: accounts.ETSPlatform.account });
      // TODO: Event testing needs to be implemented with viem
    });

    it("can be locked/unlocked by Platform (duplicate test)", async () => {
      // Reuse the channel created by User4 in the "will revert if name already exists" test
      const channelAddress = await contracts.ETSAccessControls.read.getChannelAddressFromName(["UniswapTest5"]);

      const isLocked1 = await contracts.ETSAccessControls.read.isChannelLocked([channelAddress]);
      assert.equal(isLocked1, false);

      try {
        await contracts.ETSAccessControls.write.toggleChannelLock([channelAddress], {
          account: accounts.User4.account,
        });
        assert.fail("Expected transaction to revert");
      } catch (error) {
        assert.ok(error, "Transaction should have reverted");
      }

      await contracts.ETSAccessControls.write.toggleChannelLock([channelAddress], {
        account: accounts.ETSPlatform.account,
      });
      // TODO: Event testing needs to be implemented with viem

      const isLocked2 = await contracts.ETSAccessControls.read.isChannelLocked([channelAddress]);
      assert.equal(isLocked2, true);

      await contracts.ETSAccessControls.write.toggleChannelLock([channelAddress], {
        account: accounts.ETSPlatform.account,
      });
      // TODO: Event testing needs to be implemented with viem
    });

    // Test removed: Tag balance-based pausing no longer applicable with democratized channel creation

    it("cannot be unpaused by owner if locked by platform", async () => {
      // Use the pre-deployed ETSChannel from the fixture
      const uniswapChannel = contracts.ETSChannel;
      const channelAddress = contracts.ETSChannel.address;

      // Pause as owner first (ETSPlatform owns the channel)
      await uniswapChannel.write.pause([], { account: accounts.ETSPlatform.account });
      // TODO: Event testing needs to be implemented with viem

      // Verify that it's paused.
      const isPaused = await uniswapChannel.read.paused([]);
      assert.equal(isPaused, true);

      // Now lock it at the platform level.
      await contracts.ETSAccessControls.write.toggleChannelLock([channelAddress], {
        account: accounts.ETSPlatform.account,
      });
      const isLocked = await contracts.ETSAccessControls.read.isChannelLocked([channelAddress]);
      assert.equal(isLocked, true);

      try {
        await uniswapChannel.write.unpause([], { account: accounts.ETSPlatform.account });
        assert.fail("Expected transaction to revert with UnpausingNotPermitted");
      } catch (error: any) {
        assert.ok(error.message.includes("UnpausingNotPermitted"), "Should revert with UnpausingNotPermitted error");
      }
    });

    it("must be paused before transferring to new owner", async () => {
      // Use the pre-deployed ETSChannel from the fixture
      const uniswapChannel = contracts.ETSChannel;
      const channelAddress = contracts.ETSChannel.address;

      // First unlock the channel (it was locked in the previous test)
      await contracts.ETSAccessControls.write.toggleChannelLock([channelAddress], {
        account: accounts.ETSPlatform.account,
      });

      // Then unpause it to ensure we can test the "must be paused" requirement
      await uniswapChannel.write.unpause([], { account: accounts.ETSPlatform.account });

      // Verify that channel is not paused.
      const isPaused = await uniswapChannel.read.paused([]);
      assert.equal(isPaused, false);

      try {
        await uniswapChannel.write.changeOwner([accounts.User1.account.address], {
          account: accounts.ETSPlatform.account,
        });
        assert.fail("Expected transaction to revert with 'Pausable: not paused'");
      } catch (error: any) {
        assert.ok(error.message.includes("Pausable: not paused"), "Should revert with 'Pausable: not paused' error");
      }

      await uniswapChannel.write.pause([], { account: accounts.ETSPlatform.account });

      // Attempt to transfer ownership (ETSPlatform is the actual owner from fixture)
      // Use User1 account which doesn't own any channel
      await uniswapChannel.write.changeOwner([accounts.User1.account.address], {
        account: accounts.ETSPlatform.account,
      });
      // TODO: Event testing needs to be implemented with viem
    });

    it("can only be transferred by current owner", async () => {
      // Reuse the channel created by ETSAdmin in the "are not paused when added" test
      const channelAddress = await contracts.ETSAccessControls.read.getChannelAddressFromName(["UniswapTest8"]);

      // Get ETSChannel contract instance
      const { viem } = await network.connect();
      const uniswapChannel = await viem.getContractAt("ETSChannel", channelAddress);

      // Pause the channel first
      await uniswapChannel.write.pause([], { account: accounts.ETSPlatform.account });

      try {
        await uniswapChannel.write.changeOwner([accounts.User3.account.address], {
          account: accounts.ETSPlatform.account,
        });
        assert.fail("Expected transaction to revert with 'Ownable: caller is not the owner'");
      } catch (error: any) {
        assert.ok(
          error.message.includes("Ownable: caller is not the owner"),
          "Should revert with 'Ownable: caller is not the owner' error",
        );
      }
    });

    it("when transferred should no longer belong to previous owner", async () => {
      // Use the secondChannel from the fixture which is owned by ETSPlatform
      const testChannel = contracts.secondChannel;
      const channelAddress = testChannel.address;

      // Pause the channel (required for transfers - ETSPlatform owns this channel)
      await testChannel.write.pause([], { account: accounts.ETSPlatform.account });

      // Get two accounts that don't own any channels
      const { viem } = await network.connect();
      const walletClients = await viem.getWalletClients();
      const firstNewOwner = walletClients[8]; // 9th account (index 8) - unused account
      const secondNewOwner = walletClients[9]; // 10th account (index 9) - unused account

      // Transfer the channel to first new owner
      await testChannel.write.changeOwner([firstNewOwner.account.address], {
        account: accounts.ETSPlatform.account,
      });

      // Verify first new owner is now the owner via access controls
      const channelOwnedByFirst = await contracts.ETSAccessControls.read.getChannelAddressFromOwner([
        firstNewOwner.account.address,
      ]);
      assert.equal(channelOwnedByFirst.toLowerCase(), channelAddress.toLowerCase());

      // Transfer to second new owner (channel is already paused)
      await testChannel.write.changeOwner([secondNewOwner.account.address], {
        account: firstNewOwner.account,
      });

      // Verify ownership has transferred
      const channelOwnedBySecond = await contracts.ETSAccessControls.read.getChannelAddressFromOwner([
        secondNewOwner.account.address,
      ]);
      assert.equal(channelOwnedBySecond.toLowerCase(), channelAddress.toLowerCase());

      // Verify first owner no longer owns any channel
      const channelOwnedByFirstAfter = await contracts.ETSAccessControls.read.getChannelAddressFromOwner([
        firstNewOwner.account.address,
      ]);
      assert.equal(channelOwnedByFirstAfter, "0x0000000000000000000000000000000000000000");
    });
  });
});

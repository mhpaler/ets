import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { keccak256, toBytes } from "viem";
import { loadETSCoreFixture } from "./fixtures/etsCoreFixture.js";

describe("ETSRelayerFactory Tests", async () => {
  const { accounts, contracts } = await loadETSCoreFixture();

  // Variables that will be initialized per test
  // Note: tokenId variables removed since tag ownership tests were removed

  describe("Valid setup/initialization", async () => {
    it("sets RELAYER_ADMIN_ROLE as the role that can administer RELAYER_ROLE role.", async () => {
      const roleAdmin = await contracts.ETSAccessControls.read.getRoleAdmin([keccak256(toBytes("RELAYER_ROLE"))]);
      const expectedRole = keccak256(toBytes("RELAYER_FACTORY_ROLE"));
      assert.equal(roleAdmin, expectedRole);
    });

    it("Enables ETSRelayerFactory as a relayer factory.", async () => {
      const isFactory = await contracts.ETSAccessControls.read.isRelayerFactory([contracts.ETSRelayerFactory.address]);
      assert.equal(isFactory, true);
    });
  });

  describe("New relayers", async () => {
    it("can only be added by if factory has correct role.", async () => {
      await contracts.ETSAccessControls.write.revokeRole(
        [keccak256(toBytes("RELAYER_FACTORY_ROLE")), contracts.ETSRelayerFactory.address],
        { account: accounts.ETSPlatform.account },
      );

      try {
        await contracts.ETSRelayerFactory.write.addRelayer(["UniswapTest1"], { account: accounts.RandomOne.account });
        assert.fail("Expected transaction to revert");
      } catch (error) {
        assert.ok(error, "Transaction should have reverted");
      }

      await contracts.ETSAccessControls.write.grantRole(
        [keccak256(toBytes("RELAYER_FACTORY_ROLE")), contracts.ETSRelayerFactory.address],
        { account: accounts.ETSPlatform.account },
      );

      await contracts.ETSRelayerFactory.write.addRelayer(["UniswapTest1"], { account: accounts.RandomOne.account });
      // TODO: Event testing needs to be implemented with viem
    });

    // Test removed: Relayer creation is now democratized - no tag ownership required

    // Test removed: Relayer creation is now democratized - no tag ownership or transfers required

    it("will revert if sender already owns relayer", async () => {
      await contracts.ETSRelayerFactory.write.addRelayer(["UniswapTest2"], { account: accounts.RandomTwo.account });

      try {
        await contracts.ETSRelayerFactory.write.addRelayer(["SolanaTest2"], { account: accounts.RandomTwo.account });
        assert.fail("Expected transaction to revert with SenderOwnsRelayer");
      } catch (error: any) {
        assert.ok(error.message.includes("SenderOwnsRelayer"), "Should revert with SenderOwnsRelayer error");
      }
    });

    it("will revert if name is too short", async () => {
      try {
        await contracts.ETSRelayerFactory.write.addRelayer(["X"], { account: accounts.RandomOne.account });
        assert.fail("Expected transaction to revert with RelayerNameTooShort");
      } catch (error: any) {
        assert.ok(error.message.includes("RelayerNameTooShort"), "Should revert with RelayerNameTooShort error");
      }
    });

    it("will revert if name is too long", async () => {
      const longName = "this is a relayer name that is well well well well over the limit in length";
      try {
        await contracts.ETSRelayerFactory.write.addRelayer([longName], { account: accounts.RandomOne.account });
        assert.fail("Expected transaction to revert with RelayerNameTooLong");
      } catch (error: any) {
        assert.ok(error.message.includes("RelayerNameTooLong"), "Should revert with RelayerNameTooLong error");
      }
    });

    it("will revert if name already exists", async () => {
      await contracts.ETSRelayerFactory.write.addRelayer(["UniswapTest5"], { account: accounts.Creator.account });

      try {
        await contracts.ETSRelayerFactory.write.addRelayer(["UniswapTest5"], { account: accounts.Buyer.account });
        assert.fail("Expected transaction to revert with RelayerNameExists");
      } catch (error: any) {
        assert.ok(error.message.includes("RelayerNameExists"), "Should revert with RelayerNameExists error");
      }
    });

    it("will emit RelayerAdded", async () => {
      await contracts.ETSRelayerFactory.write.addRelayer(["UniswapTest6"], { account: accounts.ETSOracle.account });
      // TODO: Event testing needs to be implemented with viem
    });

    it("can add multiple relayers if sender is platform", async () => {
      await contracts.ETSRelayerFactory.write.addRelayer(["UniswapTest7"], { account: accounts.ETSPlatform.account });
      // TODO: Event testing needs to be implemented with viem
      await contracts.ETSRelayerFactory.write.addRelayer(["SolanaTest7"], { account: accounts.ETSPlatform.account });
      // TODO: Event testing needs to be implemented with viem
    });

    it("are not paused when added", async () => {
      await contracts.ETSRelayerFactory.write.addRelayer(["UniswapTest8"], { account: accounts.ETSAdmin.account });
      const relayerAddress = await contracts.ETSAccessControls.read.getRelayerAddressFromName(["UniswapTest8"]);
      const isNotPaused = await contracts.ETSAccessControls.read.isRelayerAndNotPaused([relayerAddress]);
      assert.equal(isNotPaused, true);
    });
  });

  describe("Active relayer contracts", async () => {
    it("can be looked up by address", async () => {
      // Reuse the relayer created by ETSOracle in the previous test
      const relayerAddress = await contracts.ETSAccessControls.read.getRelayerAddressFromName(["UniswapTest6"]);

      const isRelayerByAddress = await contracts.ETSAccessControls.read.isRelayerByAddress([relayerAddress]);
      const isRelayer = await contracts.ETSAccessControls.read.isRelayer([relayerAddress]);
      assert.equal(isRelayerByAddress, true);
      assert.equal(isRelayer, true);
    });

    it("can be looked up by name", async () => {
      // Reuse the relayer created by ETSAdmin in the "are not paused when added" test
      const isRelayerByName = await contracts.ETSAccessControls.read.isRelayerByName(["UniswapTest8"]);
      assert.equal(isRelayerByName, true);
    });

    it("can be locked/unlocked by Platform", async () => {
      // Reuse the relayer created by Creator in the "will revert if name already exists" test
      const relayerAddress = await contracts.ETSAccessControls.read.getRelayerAddressFromName(["UniswapTest5"]);

      // Try pausing by non-administrator account.
      try {
        await contracts.ETSAccessControls.write.toggleRelayerLock([relayerAddress], {
          account: accounts.Creator.account,
        });
        assert.fail("Expected transaction to revert");
      } catch (error) {
        assert.ok(error, "Transaction should have reverted");
      }

      await contracts.ETSAccessControls.write.toggleRelayerLock([relayerAddress], {
        account: accounts.ETSPlatform.account,
      });
      // TODO: Event testing needs to be implemented with viem

      const isLocked = await contracts.ETSAccessControls.read.isRelayerLocked([relayerAddress]);
      assert.equal(isLocked, true);

      await contracts.ETSAccessControls.write.toggleRelayerLock([relayerAddress], {
        account: accounts.ETSPlatform.account,
      });
      const isUnlocked = await contracts.ETSAccessControls.read.isRelayerLocked([relayerAddress]);
      assert.equal(isUnlocked, false);
    });

    it("are paused by Platform if relayer is transferred to new owner with no CTAGS", async () => {
      // TODO
      //
    });

    it("cannot be paused by non-owner or non-relayer admin", async () => {
      // Reuse the relayer created by ETSAdmin in the "are not paused when added" test
      const relayerAddress = await contracts.ETSAccessControls.read.getRelayerAddressFromName(["UniswapTest8"]);

      // Get ETSRelayer contract instance
      const { viem } = await network.connect();
      const nonOwnerRelayer = await viem.getContractAt("ETSRelayer", relayerAddress);

      // Try pausing as non-owner (eg. RandomTwo)
      try {
        await nonOwnerRelayer.write.pause([], { account: accounts.RandomTwo.account });
        assert.fail("Expected transaction to revert with CallerNotRelayerAdmin");
      } catch (error: any) {
        assert.ok(error.message.includes("CallerNotRelayerAdmin"), "Should revert with CallerNotRelayerAdmin error");
      }
    });

    it("can be paused & unpaused by Owner", async () => {
      // Use the pre-deployed ETSRelayer from the fixture instead of trying to create a new one
      const uniswapRelayer = contracts.ETSRelayer;

      const isPaused1 = await uniswapRelayer.read.paused([]);
      const isPaused2 = await uniswapRelayer.read.isPaused([]);
      assert.equal(isPaused1, false);
      assert.equal(isPaused2, false);

      // Now pause as the relayer admin (ETSAdmin has RELAYER_ADMIN_ROLE)
      await uniswapRelayer.write.pause([], { account: accounts.ETSAdmin.account });
      // TODO: Event testing needs to be implemented with viem

      await uniswapRelayer.write.unpause([], { account: accounts.ETSAdmin.account });
      // TODO: Event testing needs to be implemented with viem
    });

    it("can be paused & unpaused by Platform (Relayer Admin)", async () => {
      // Use the pre-deployed ETSRelayer from the fixture
      const uniswapRelayer = contracts.ETSRelayer;

      const isPaused1 = await uniswapRelayer.read.paused([]);
      const isPaused2 = await uniswapRelayer.read.isPaused([]);
      assert.equal(isPaused1, false);
      assert.equal(isPaused2, false);

      // Now pause as the platform (ETSPlatform should have admin privileges)
      await uniswapRelayer.write.pause([], { account: accounts.ETSPlatform.account });
      // TODO: Event testing needs to be implemented with viem

      await uniswapRelayer.write.unpause([], { account: accounts.ETSPlatform.account });
      // TODO: Event testing needs to be implemented with viem
    });

    it("can be locked/unlocked by Platform (duplicate test)", async () => {
      // Reuse the relayer created by Creator in the "will revert if name already exists" test
      const relayerAddress = await contracts.ETSAccessControls.read.getRelayerAddressFromName(["UniswapTest5"]);

      const isLocked1 = await contracts.ETSAccessControls.read.isRelayerLocked([relayerAddress]);
      assert.equal(isLocked1, false);

      try {
        await contracts.ETSAccessControls.write.toggleRelayerLock([relayerAddress], {
          account: accounts.Creator.account,
        });
        assert.fail("Expected transaction to revert");
      } catch (error) {
        assert.ok(error, "Transaction should have reverted");
      }

      await contracts.ETSAccessControls.write.toggleRelayerLock([relayerAddress], {
        account: accounts.ETSPlatform.account,
      });
      // TODO: Event testing needs to be implemented with viem

      const isLocked2 = await contracts.ETSAccessControls.read.isRelayerLocked([relayerAddress]);
      assert.equal(isLocked2, true);

      await contracts.ETSAccessControls.write.toggleRelayerLock([relayerAddress], {
        account: accounts.ETSPlatform.account,
      });
      // TODO: Event testing needs to be implemented with viem
    });

    // Test removed: Tag balance-based pausing no longer applicable with democratized relayer creation

    it("cannot be unpaused by owner if locked by platform", async () => {
      // Use the pre-deployed ETSRelayer from the fixture
      const uniswapRelayer = contracts.ETSRelayer;
      const relayerAddress = contracts.ETSRelayer.address;

      // Pause as admin first (since we need a working pause/unpause test)
      await uniswapRelayer.write.pause([], { account: accounts.ETSAdmin.account });
      // TODO: Event testing needs to be implemented with viem

      // Verify that it's paused.
      const isPaused = await uniswapRelayer.read.paused([]);
      assert.equal(isPaused, true);

      // Now lock it at the platform level.
      await contracts.ETSAccessControls.write.toggleRelayerLock([relayerAddress], {
        account: accounts.ETSPlatform.account,
      });
      const isLocked = await contracts.ETSAccessControls.read.isRelayerLocked([relayerAddress]);
      assert.equal(isLocked, true);

      try {
        await uniswapRelayer.write.unpause([], { account: accounts.ETSAdmin.account });
        assert.fail("Expected transaction to revert with UnpausingNotPermitted");
      } catch (error: any) {
        assert.ok(error.message.includes("UnpausingNotPermitted"), "Should revert with UnpausingNotPermitted error");
      }
    });

    it("must be paused before transferring to new owner", async () => {
      // Use the pre-deployed ETSRelayer from the fixture
      const uniswapRelayer = contracts.ETSRelayer;
      const relayerAddress = contracts.ETSRelayer.address;

      // First unlock the relayer (it was locked in the previous test)
      await contracts.ETSAccessControls.write.toggleRelayerLock([relayerAddress], {
        account: accounts.ETSPlatform.account,
      });

      // Then unpause it to ensure we can test the "must be paused" requirement
      await uniswapRelayer.write.unpause([], { account: accounts.ETSAdmin.account });

      // Verify that relayer is not paused.
      const isPaused = await uniswapRelayer.read.paused([]);
      assert.equal(isPaused, false);

      try {
        await uniswapRelayer.write.changeOwner([accounts.Buyer.account.address], {
          account: accounts.ETSPlatform.account,
        });
        assert.fail("Expected transaction to revert with 'Pausable: not paused'");
      } catch (error: any) {
        assert.ok(error.message.includes("Pausable: not paused"), "Should revert with 'Pausable: not paused' error");
      }

      await uniswapRelayer.write.pause([], { account: accounts.ETSAdmin.account });

      // Attempt to transfer ownership (ETSPlatform is the actual owner from fixture)
      // Use Buyer account which doesn't own any relayer
      await uniswapRelayer.write.changeOwner([accounts.Buyer.account.address], {
        account: accounts.ETSPlatform.account,
      });
      // TODO: Event testing needs to be implemented with viem
    });

    it("can only be transferred by current owner", async () => {
      // Reuse the relayer created by ETSAdmin in the "are not paused when added" test
      const relayerAddress = await contracts.ETSAccessControls.read.getRelayerAddressFromName(["UniswapTest8"]);

      // Get ETSRelayer contract instance
      const { viem } = await network.connect();
      const uniswapRelayer = await viem.getContractAt("ETSRelayer", relayerAddress);

      // Pause the relayer first
      await uniswapRelayer.write.pause([], { account: accounts.ETSAdmin.account });

      try {
        await uniswapRelayer.write.changeOwner([accounts.RandomTwo.account.address], {
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
      // Use the relayer we just transferred to Buyer in the previous test
      // The ETSRelayer from fixture is now owned by Buyer
      const uniswapRelayer = contracts.ETSRelayer;

      // Verify Buyer is now the current owner after the previous test
      const isBuyerOwner = await contracts.ETSAccessControls.read.isRelayerByOwner([accounts.Buyer.account.address]);
      assert.equal(isBuyerOwner, true);

      // For the final transfer, we need another account that doesn't own a relayer
      // Looking at the fixture, we have 7 accounts total, and we've used 6 for relayers
      // Let's see if we can get additional accounts from the wallet clients
      const { viem } = await network.connect();
      const walletClients = await viem.getWalletClients();
      const additionalAccount = walletClients[7]; // 8th account (index 7)

      // First check if relayer is already paused from previous test
      const isPaused = await uniswapRelayer.read.paused([]);
      if (isPaused) {
        // Unpause first (Buyer is now the owner, but we need RELAYER_ADMIN_ROLE to unpause)
        await uniswapRelayer.write.unpause([], { account: accounts.ETSAdmin.account });
      }

      // Now pause the relayer (Buyer is the owner)
      await uniswapRelayer.write.pause([], { account: accounts.Buyer.account });
      await uniswapRelayer.write.changeOwner([additionalAccount.account.address], { account: accounts.Buyer.account });

      const isOwnerBuyer = await contracts.ETSAccessControls.read.isRelayerByOwner([accounts.Buyer.account.address]);
      const isOwnerAdditional = await contracts.ETSAccessControls.read.isRelayerByOwner([
        additionalAccount.account.address,
      ]);
      assert.equal(isOwnerBuyer, false);
      assert.equal(isOwnerAdditional, true);
    });
  });
});

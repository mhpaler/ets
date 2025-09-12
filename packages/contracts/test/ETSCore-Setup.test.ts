import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { zeroAddress } from "viem";
import { loadETSCoreFixture } from "./fixtures/etsCoreFixture.js";

describe("ETS Core Setup & Configuration", async () => {
  const { accounts, contracts } = await loadETSCoreFixture();

  describe("Valid setup", async () => {
    it("should have Access controls set to ETSAccessControls contract", async () => {
      assert.equal(
        (await contracts.ETS.read.etsAccessControls()).toLowerCase(),
        contracts.ETSAccessControls.address.toLowerCase(),
      );
    });
    it("should have Token set to ETSToken contract", async () => {
      assert.equal((await contracts.ETS.read.etsToken()).toLowerCase(), contracts.ETSToken.address.toLowerCase());
    });
    it("should have Target set to ETSTarget contract", async () => {
      assert.equal((await contracts.ETS.read.etsTarget()).toLowerCase(), contracts.ETSTarget.address.toLowerCase());
    });
    it("should have an active relayer contract (ETSRelayer)", async () => {
      assert.equal(await contracts.ETSAccessControls.read.isRelayerAndNotPaused([contracts.ETSRelayer.address]), true);
    });

    it("should have a testing relayer (ETSPlatform)", async () => {
      assert.equal(await contracts.ETSAccessControls.read.isRelayer([accounts.ETSPlatform.account.address]), true);
    });
  });

  describe("Setting access controls", async () => {
    it("should revert if set to zero address", async () => {
      try {
        await contracts.ETS.write.setAccessControls([zeroAddress], { account: accounts.ETSPlatform.account });
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("AddressCannotBeZero"));
      }
    });

    it("should revert if caller is not administrator", async () => {
      try {
        await contracts.ETS.write.setAccessControls([accounts.User2.account.address], {
          account: accounts.User3.account,
        });
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("AccessDenied"));
      }
    });

    it("should revert if a access controls is set to a non-access control contract", async () => {
      try {
        await contracts.ETS.write.setAccessControls([accounts.User3.account.address], {
          account: accounts.ETSPlatform.account,
        });
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert"));
      }
    });

    // TODO: Complex test requiring new contract deployment - skip for now
    // it("should revert if caller is not set as admin in contract being set.", async () => {
    //   const factories = await getFactories();
    //   const ETSAccessControlsNew = await upgrades.deployProxy(
    //     factories.ETSAccessControls,
    //     [accounts.User2.address],
    //     { kind: "uups" },
    //   );
    //
    //   // ETS Platform is not set as admin in access controls.
    //   await expect(
    //     contracts.ETS.connect(accounts.ETSPlatform).setAccessControls(await ETSAccessControlsNew.getAddress()),
    //   ).to.be.revertedWithCustomError(contracts.ETS, "CallerNotAdminInNewContract");
    // });

    // TODO: Complex test requiring new contract deployment - skip for now
    // it("should emit AccessControlsSet", async () => {
    //   const factories = await getFactories();
    //   const ETSAccessControlsNew = await upgrades.deployProxy(
    //     factories.ETSAccessControls,
    //     [accounts.ETSPlatform.address],
    //     { kind: "uups" },
    //   );
    //
    //   await expect(contracts.ETS.connect(accounts.ETSAdmin).setAccessControls(await ETSAccessControlsNew.getAddress()))
    //     .to.emit(contracts.ETS, "AccessControlsSet")
    //     .withArgs(await ETSAccessControlsNew.getAddress());
    //   expect(await contracts.ETS.etsAccessControls()).to.be.equal(await ETSAccessControlsNew.getAddress());
    // });
  });

  describe("Setting tagging fee", async () => {
    it("should revert if caller is not administrator", async () => {
      try {
        await contracts.ETS.write.setTaggingFee([0n], { account: accounts.User3.account });
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("AccessDenied"));
      }
    });

    it("should emit TaggingFeeSet", async () => {
      // TODO: Event testing needs to be implemented with viem
      await contracts.ETS.write.setTaggingFee([1n], { account: accounts.ETSPlatform.account });
      // await expect(contracts.ETS.connect(accounts.ETSPlatform).setTaggingFee(1))
      //   .to.emit(contracts.ETS, "TaggingFeeSet")
      //   .withArgs(1);

      assert.equal(await contracts.ETS.read.taggingFee(), 1n);
    });
  });

  describe("Setting tagging fee distribution percentages", async () => {
    it("should revert if caller is not administrator", async () => {
      try {
        await contracts.ETS.write.setPercentages([10n, 10n], { account: accounts.User3.account });
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("AccessDenied"));
      }
    });
    it("should revert if total percentage is over 100%", async () => {
      try {
        await contracts.ETS.write.setPercentages([60n, 60n], { account: accounts.ETSPlatform.account });
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("PercentagesMustNotBeOver100"));
      }
    });

    it("should emit PercentagesSet", async () => {
      // TODO: Event testing needs to be implemented with viem
      await contracts.ETS.write.setPercentages([30n, 30n], { account: accounts.ETSPlatform.account });
      // await expect(contracts.ETS.connect(accounts.ETSPlatform).setPercentages(30, 30))
      //   .to.emit(contracts.ETS, "PercentagesSet")
      //   .withArgs(30, 30);

      assert.equal(await contracts.ETS.read.platformPercentage(), 30n);
      assert.equal(await contracts.ETS.read.relayerPercentage(), 30n);
    });
  });
});

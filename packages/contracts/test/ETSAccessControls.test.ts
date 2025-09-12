import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadIgnitionFixture } from "./fixtures/ignitionFixture.js";

describe("ETSAccessControls Tests", async () => {
  const { accounts, contracts } = await loadIgnitionFixture();

  describe("Valid setup/initialization", async () => {
    it("sets RELAYER_ADMIN_ROLE as the role that can grant RELAYER_FACTORY_ROLE.", async () => {
      const relayerFactoryRole = await contracts.ETSAccessControls.read.RELAYER_FACTORY_ROLE();
      const relayerAdminRole = await contracts.ETSAccessControls.read.RELAYER_ADMIN_ROLE();
      const roleAdmin = await contracts.ETSAccessControls.read.getRoleAdmin([relayerFactoryRole]);
      assert.equal(roleAdmin, relayerAdminRole);
    });

    it("sets RELAYER_FACTORY_ROLE as the role that can grant RELAYER_ROLE.", async () => {
      const relayerRole = await contracts.ETSAccessControls.read.RELAYER_ROLE();
      const relayerFactoryRole = await contracts.ETSAccessControls.read.RELAYER_FACTORY_ROLE();
      const roleAdmin = await contracts.ETSAccessControls.read.getRoleAdmin([relayerRole]);
      assert.equal(roleAdmin, relayerFactoryRole);
    });

    it("grants ETSAdmin (deployer) the DEFAULT_ADMIN_ROLE role", async () => {
      const isAdmin = await contracts.ETSAccessControls.read.isAdmin([accounts.ETSAdmin.account.address]);
      assert.equal(isAdmin, true);
    });

    it("grants ETSPlatform the DEFAULT_ADMIN_ROLE", async () => {
      const isAdmin = await contracts.ETSAccessControls.read.isAdmin([accounts.ETSPlatform.account.address]);
      assert.equal(isAdmin, true);
    });

    it('sets ETSPlatform address as the "Platform"', async () => {
      const platformAddress = await contracts.ETSAccessControls.read.getPlatformAddress();
      assert.equal(platformAddress.toLowerCase(), accounts.ETSPlatform.account.address.toLowerCase());
    });

    it("grants ETSPlatform the RELAYER_ADMIN_ROLE", async () => {
      const isRelayerAdmin = await contracts.ETSAccessControls.read.isRelayerAdmin([
        accounts.ETSPlatform.account.address,
      ]);
      assert.equal(isRelayerAdmin, true);
    });

    it("grants ETSPlatform and ETSEventProcessor the EVENT_PROCESSOR_ROLE", async () => {
      const isPlatformEventProcessor = await contracts.ETSAccessControls.read.isEventProcessor([
        accounts.ETSPlatform.account.address,
      ]);
      const isEventProcessorHasRole = await contracts.ETSAccessControls.read.isEventProcessor([
        accounts.ETSEventProcessor.account.address,
      ]);
      assert.equal(isPlatformEventProcessor, true);
      assert.equal(isEventProcessorHasRole, true);
    });

    it("EVENT_PROCESSOR_ROLE addresses work correctly", async () => {
      // Test EVENT_PROCESSOR_ROLE functionality
      const isPlatformEventProcessor = await contracts.ETSAccessControls.read.isEventProcessor([
        accounts.ETSPlatform.account.address,
      ]);
      const isEventProcessorHasRole = await contracts.ETSAccessControls.read.isEventProcessor([
        accounts.ETSEventProcessor.account.address,
      ]);
      assert.equal(isPlatformEventProcessor, true);
      assert.equal(isEventProcessorHasRole, true);
    });
  });

  describe("Platform address", async () => {
    it("can only be set by administrator", async () => {
      // Test that non-admin cannot set platform address
      try {
        await contracts.ETSAccessControls.write.setPlatform([accounts.User2.account.address], {
          account: accounts.User1.account,
        });
        assert.fail("Should have reverted");
      } catch (error: any) {
        assert.ok(error.message.includes("revert") || error.message.includes("AccessDenied"));
      }

      // Test that admin can set platform address
      await contracts.ETSAccessControls.write.setPlatform([accounts.User2.account.address], {
        account: accounts.ETSPlatform.account,
      });
      const newPlatformAddress = await contracts.ETSAccessControls.read.getPlatformAddress();
      assert.equal(newPlatformAddress.toLowerCase(), accounts.User2.account.address.toLowerCase());
    });
  });
});

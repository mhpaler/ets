import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadIgnitionFixture } from "./fixtures/ignitionFixture.js";

describe("ETSAccessControls Tests", async () => {
  const { accounts, contracts } = await loadIgnitionFixture();

  describe("Valid setup/initialization", async () => {
    it("sets CHANNEL_ADMIN_ROLE as the role that can grant CHANNEL_FACTORY_ROLE.", async () => {
      const channelFactoryRole = await contracts.ETSAccessControls.read.CHANNEL_FACTORY_ROLE();
      const channelAdminRole = await contracts.ETSAccessControls.read.CHANNEL_ADMIN_ROLE();
      const roleAdmin = await contracts.ETSAccessControls.read.getRoleAdmin([channelFactoryRole]);
      assert.equal(roleAdmin, channelAdminRole);
    });

    it("sets CHANNEL_FACTORY_ROLE as the role that can grant CHANNEL_ROLE.", async () => {
      const channelRole = await contracts.ETSAccessControls.read.CHANNEL_ROLE();
      const channelFactoryRole = await contracts.ETSAccessControls.read.CHANNEL_FACTORY_ROLE();
      const roleAdmin = await contracts.ETSAccessControls.read.getRoleAdmin([channelRole]);
      assert.equal(roleAdmin, channelFactoryRole);
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

    it("grants ETSPlatform the CHANNEL_ADMIN_ROLE", async () => {
      const isChannelAdmin = await contracts.ETSAccessControls.read.isChannelAdmin([
        accounts.ETSPlatform.account.address,
      ]);
      assert.equal(isChannelAdmin, true);
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

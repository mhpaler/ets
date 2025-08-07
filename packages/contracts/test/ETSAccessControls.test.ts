import { expect } from "chai";
import { ethers } from "hardhat";
import type { Accounts, Contracts } from "./setup";
import { setup } from "./setup"; // No .js extension

describe("ETSAccessControls Tests", () => {
  let accounts: Accounts;
  let contracts: Contracts;

  beforeEach("Setup test", async () => {
    // Using object destructuring as requested
    const result = await setup();
    ({ accounts, contracts } = result);
  });

  describe("Valid setup/initialization", async () => {
    it("sets RELAYER_ADMIN_ROLE as the role that can grant RELAYER_FACTORY_ROLE.", async () => {
      expect(await contracts.ETSAccessControls.getRoleAdmin(ethers.id("RELAYER_FACTORY_ROLE"))).to.be.equal(
        await ethers.id("RELAYER_ADMIN_ROLE"),
      );
    });

    it("sets RELAYER_FACTORY_ROLE as the role that can grant RELAYER_ROLE.", async () => {
      expect(await contracts.ETSAccessControls.getRoleAdmin(ethers.id("RELAYER_ROLE"))).to.be.equal(
        await ethers.id("RELAYER_FACTORY_ROLE"),
      );
    });

    it("grants ETSAdmin (deployer) the DEFAULT_ADMIN_ROLE role", async () => {
      expect(await contracts.ETSAccessControls.isAdmin(accounts.ETSAdmin.address)).to.be.equal(true);
    });

    it("grants ETSPlatform the DEFAULT_ADMIN_ROLE", async () => {
      expect(await contracts.ETSAccessControls.isAdmin(accounts.ETSPlatform.address)).to.be.equal(true);
    });

    it('sets ETSPlatform address as the "Platform"', async () => {
      expect(await contracts.ETSAccessControls.getPlatformAddress()).to.be.equal(accounts.ETSPlatform.address);
    });

    it("grants ETSPlatform the RELAYER_ADMIN_ROLE", async () => {
      expect(await contracts.ETSAccessControls.isRelayerAdmin(accounts.ETSPlatform.address)).to.be.equal(true);
    });
  });

  describe("Platform address", async () => {
    it("can only be set by administrator", async () => {
      await expect(contracts.ETSAccessControls.connect(accounts.Buyer).setPlatform(accounts.RandomOne.address)).to.be
        .reverted;

      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).setPlatform(accounts.RandomOne.address);
      expect(await contracts.ETSAccessControls.getPlatformAddress()).to.be.equal(accounts.RandomOne.address);
    });
  });
});

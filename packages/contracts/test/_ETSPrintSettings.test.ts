import { setup } from "./setup";
import type { Accounts, Contracts, InitSettings } from "./setup";

describe("============= ETS TEST SUITE SETTINGS =============", () => {
  // we create a setup function that can be called by every test and setup variable for easy to read tests
  it("is running with the preceding settings", async () => {
    const result = await setup();
    const accounts: Accounts = result.accounts;
    const contracts: Contracts = result.contracts;
    const initSettings: InitSettings = result.initSettings;

    console.info("======================== ROLES ============================");
    console.info("RELAYER_ROLE", await contracts.ETSAccessControls.RELAYER_ROLE());
    console.info("RELAYER_FACTORY_ROLE", await contracts.ETSAccessControls.RELAYER_FACTORY_ROLE());
    console.info("RELAYER_ADMIN_ROLE", await contracts.ETSAccessControls.RELAYER_ADMIN_ROLE());
    console.info("SMART_CONTRACT_ROLE", await contracts.ETSAccessControls.SMART_CONTRACT_ROLE());

    console.info("======================== ACCOUNTS ============================");
    console.info("ETSAdmin:", accounts.ETSAdmin.address);
    console.info("ETSPlatform:", accounts.ETSPlatform.address);
    console.info("Buyer:", accounts.Buyer.address);
    console.info("RandomOne:", accounts.RandomOne.address);
    console.info("RandomTwo:", accounts.RandomTwo.address);
    console.info("Creator:", accounts.Creator.address);

    console.info("======================== CONTRACTS ============================");
    console.info("WETH:", await contracts.WETH.getAddress());
    console.info("ETSAccessControls:", await contracts.ETSAccessControls.getAddress());
    console.info("ETSToken:", await contracts.ETSToken.getAddress());
    console.info("ETSAuctionHouse:", await contracts.ETSAuctionHouse.getAddress());
    console.info("ETSTarget:", await contracts.ETSTarget.getAddress());
    console.info("ETSEnrichTarget:", await contracts.ETSEnrichTarget.getAddress());
    console.info("ETS:", await contracts.ETS.getAddress());
    console.info("ETSRelayerFactory:", await contracts.ETSRelayerFactory.getAddress());
    console.info("ETSRelayerImplementation:", await contracts.ETSRelayerImplementation.getAddress());
    console.info("ETSRelayer:", await contracts.ETSRelayer.getAddress());

    console.info("======================== INIT SETTINGS ============================");
    console.info(initSettings);
  });
});

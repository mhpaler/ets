const { setup } = require("./setup.js");
//let accounts, factories, contracts.ETSAccessControls, ETSLifeCycleControls, contracts.ETSToken;
let _targetURI;

describe("============= ETS TEST SUITE SETTINGS =============", () => {
  // we create a setup function that can be called by every test and setup variable for easy to read tests
  it("is running with the preceding settings", async () => {
    [accounts, contracts, initSettings] = await setup();
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
    console.info("WETH:", contracts.WETH.address);
    console.info("ETSAccessControls:", contracts.ETSAccessControls.address);
    console.info("ETSToken:", contracts.ETSToken.address);
    console.info("ETSAuctionHouse:", contracts.ETSAuctionHouse.address);
    console.info("ETSTarget:", await contracts.ETSTarget.getAddress());
    console.info("ETSEnrichTarget:", contracts.ETSEnrichTarget.address);
    console.info("ETS:", await contracts.ETS.getAddress());
    console.info("ETSRelayerFactory:", contracts.ETSRelayerFactory.address);
    console.info("ETSRelayerImplementation:", contracts.ETSRelayerImplementation.address);
    console.info("ETSRelayer:", await contracts.ETSRelayer.getAddress());
    console.info("======================== INIT SETTINGS ============================");
    console.info(initSettings);
  });
});

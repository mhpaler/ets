const { setup } = require("./setup.js");
//let accounts, factories, contracts.ETSAccessControls, ETSLifeCycleControls, contracts.ETSToken;
let targetURI;

describe("============= ETS TEST SUITE SETTINGS =============", function () {
  // we create a setup function that can be called by every test and setup variable for easy to read tests
  it("is running with the preceding settings", async function () {
    [accounts, contracts, initSettings] = await setup();
    console.log("======================== ROLES ============================");
    console.log("RELAYER_ROLE", await contracts.ETSAccessControls.RELAYER_ROLE());
    console.log("RELAYER_FACTORY_ROLE", await contracts.ETSAccessControls.RELAYER_FACTORY_ROLE());
    console.log("RELAYER_ADMIN_ROLE", await contracts.ETSAccessControls.RELAYER_ADMIN_ROLE());
    console.log("SMART_CONTRACT_ROLE", await contracts.ETSAccessControls.SMART_CONTRACT_ROLE());
    console.log("======================== ACCOUNTS ============================");
    console.log("ETSAdmin:", accounts.ETSAdmin.address);
    console.log("ETSPlatform:", accounts.ETSPlatform.address);
    console.log("Buyer:", accounts.Buyer.address);
    console.log("RandomOne:", accounts.RandomOne.address);
    console.log("RandomTwo:", accounts.RandomTwo.address);
    console.log("Creator:", accounts.Creator.address);
    console.log("======================== CONTRACTS ============================");
    console.log("WMATIC:", contracts.WMATIC.address);
    console.log("ETSAccessControls:", contracts.ETSAccessControls.address);
    console.log("ETSToken:", contracts.ETSToken.address);
    console.log("ETSAuctionHouse:", contracts.ETSAuctionHouse.address);
    console.log("ETSTarget:", contracts.ETSTarget.address);
    console.log("ETSEnrichTarget:", contracts.ETSEnrichTarget.address);
    console.log("ETS:", contracts.ETS.address);
    console.log("ETSRelayerFactory:", contracts.ETSRelayerFactory.address);
    console.log("ETSRelayerImplementation:", contracts.ETSRelayerImplementation.address);
    console.log("ETSRelayer:", contracts.ETSRelayer.address);
    console.log("======================== INIT SETTINGS ============================");
    console.log(initSettings);
  });
});

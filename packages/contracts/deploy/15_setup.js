const { ethers } = require("hardhat");

module.exports = async ({
  getChainId,
  getNamedAccounts,
  deployments
}) => {
    const chainId = await getChainId();
    const {ETSAdmin, ETSPublisher} = await getNamedAccounts();

    const ETSAccessControls = await deployments.get("ETSAccessControls");
    const ETS = await deployments.get("ETS");
    const ETSEnsure = await deployments.get("ETSEnsure");
    const EVMNFT = await deployments.get("EVMNFT");
    const EVMNFTMock = await deployments.get("EVMNFTMock");

    const etsAccessControls = await ethers.getContractAt("ETSAccessControls", ETSAccessControls.address);
    const ets = await ethers.getContractAt("ETS", ETS.address);
    const evmNft = await ethers.getContractAt("EVMNFT", EVMNFT.address);
    const evmNftMock = await ethers.getContractAt("EVMNFTMock", EVMNFTMock.address);

    const smartContractRole = await etsAccessControls.SMART_CONTRACT_ROLE();
    await etsAccessControls.grantRole( smartContractRole, ETSAdmin, { from: ETSAdmin } );
    console.log(`Smart contract role granted to ${ETSAdmin}`);

    await etsAccessControls.grantRole(ethers.utils.id("PUBLISHER"), ETSPublisher);
    console.log(`Publisher role granted to ${ETSPublisher}`);

    await ets.updateETSEnsure(ETSEnsure.address);
    console.log(`ets.ETSEnsure contract set to ${ETSEnsure.address}`);

    const evmNftName = await evmNft.name();
    await etsAccessControls.addTargetType(EVMNFT.address, evmNftName);
    console.log('Target type role granted to', EVMNFT.address);

    if (chainId == 31337 || chainId == 80001) {
      const evmNftMockName = await evmNftMock.name();
      await etsAccessControls.addTargetType(EVMNFTMock.address, evmNftMockName);
      console.log('For testing only, target type role granted to', EVMNFTMock.address);
    }

    // Trying to add admin as a target type to be able
    // to call core tagging contract directly, not working...
    //await etsAccessControls.addTargetType(ETSAdmin, evmNftName);
    //console.log('Target type role granted to', ETSAdmin)
};

module.exports.tags = ['ets_deploy'];
module.exports.dependencies = ['ets_evmTagger', 'ets_evmMockTagger']

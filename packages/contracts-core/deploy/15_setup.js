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

    const etsAccessControls = await ethers.getContractAt("ETSAccessControls", ETSAccessControls.address);
    const ets = await ethers.getContractAt("ETS", ETS.address);
    const evmNft = await ethers.getContractAt("EVMNFT", EVMNFT.address);

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

    // Trying to add admin wallet as a target type to be able
    // to call core tagging contract directly, not working...
    await etsAccessControls.addTargetType(ETSAdmin, "admin" + evmNftName);
    console.log('Target type role granted to', ETSAdmin)
};

module.exports.tags = ['ets_deploy'];
module.exports.dependencies = ['ets_evmTagger']

const { networkConfig } = require('../helper-hardhat-config.js');
const { verify } = require("./utils/verify.js");
const { saveNetworkConfig } = require("./utils/config.js");

module.exports = async ({
  getChainId,
  getNamedAccounts,
  deployments
}) => {
  const { deploy, log, get } = deployments;
  const { ETSAdmin } = await getNamedAccounts();
  const chainId = await getChainId();
  let linkTokenAddress;
  let oracle;
  let additionalMessage = "";
  //set log level to ignore non errors
  ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

  if (chainId == 31337) {
    let linkToken = await get('LinkToken');
    let mockOracle = await get('MockOracle');
    linkTokenAddress = linkToken.address;
    oracle = mockOracle.address;
    additionalMessage = " --linkaddress " + linkTokenAddress;
  } else {
    linkTokenAddress = networkConfig[chainId]['linkToken'];
    oracle = networkConfig[chainId]['oracle'];
  }

  const jobId = ethers.utils.toUtf8Bytes(networkConfig[chainId]['jobId']);
  const fee = networkConfig[chainId]['fee'];
  const networkName = networkConfig[chainId]['name'];

  // console.log("link:", {linkTokenAddress, oracle, jobId, fee, networkName});

  const etsEnsure = await deploy('ETSEnsure', {
    from: ETSAdmin,
    args: [oracle, jobId, fee, linkTokenAddress],
    log: true
  });

  //await verify("ETSEnsure", etsEnsure, etsEnsure.address, []);
  await saveNetworkConfig("ETSEnsure", etsEnsure, false);

  log("====================================================");
  log('APIConsumer deployed to -> ' + etsEnsure.address);
  log("====================================================");
  log("Run API Consumer contract with following command:")
  log("npx hardhat request-ensure --contract " + etsEnsure.address + " --network " + networkName)
  log("====================================================")
}
module.exports.tags = ['ets_ensure'];
module.exports.dependencies = ['mocks'];

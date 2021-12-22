const {getAccountAddress} = require('@blockrocket/utils');

const MNEMONIC = process.env.PROTOTYPE_BR_KEY || '';
const INFURA_KEY = process.env.PROTOTYPE_BR_INFURA_KEY || '';

const HashtagAccessControls = artifacts.require('HashtagAccessControls');
const HashtagProtocol = artifacts.require('HashtagProtocol');

module.exports = async function (deployer, network, accounts) {
    console.log('Deploying HashtagProtocol to network: ' + network);

    const creator = getAccountAddress(accounts, 0, network, MNEMONIC, INFURA_KEY);
    const platform = creator;

    const accessControls = await HashtagAccessControls.deployed();
    await deployer.deploy(HashtagProtocol, accessControls.address, platform, {from: creator});
    const hashtagProtocol = await HashtagProtocol.deployed();
    console.log('hashtagProtocol.address', hashtagProtocol.address);

    console.log('successful!');
};

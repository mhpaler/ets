const {getAccountAddress} = require('@blockrocket/utils');

const MNEMONIC = process.env.PROTOTYPE_BR_KEY || '';
const INFURA_KEY = process.env.PROTOTYPE_BR_INFURA_KEY || '';

const HashtagAccessControls = artifacts.require('HashtagAccessControls');
const HashtagProtocol = artifacts.require('HashtagProtocol');
const HashtagLinkSplitter = artifacts.require('HashtagLinkSplitter');

module.exports = async function (deployer, network, accounts) {
    console.log('Deploying HashtagLinkSplitter to network: ' + network);

    const creator = getAccountAddress(accounts, 0, network, MNEMONIC, INFURA_KEY);

    const accessControls = await HashtagAccessControls.deployed();
    const hashtagProtocol = await HashtagProtocol.deployed();
    await deployer.deploy(HashtagLinkSplitter, accessControls.address, hashtagProtocol.address, {from: creator});
    const splitter = await HashtagLinkSplitter.deployed();
    console.log('splitter.address', splitter.address);

    console.log('successful!');
};

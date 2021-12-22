const {getAccountAddress} = require('@blockrocket/utils');

const MNEMONIC = process.env.PROTOTYPE_BR_KEY || '';
const INFURA_KEY = process.env.PROTOTYPE_BR_INFURA_KEY || '';

const HashtagAccessControls = artifacts.require('HashtagAccessControls');
const HashtagProtocol = artifacts.require('HashtagProtocol');
const ERC721HashtagRegistry = artifacts.require('ERC721HashtagRegistry');

module.exports = async function (deployer, network, accounts) {
    console.log('Deploying ERC721HashtagRegistry to network: ' + network);

    const creator = getAccountAddress(accounts, 0, network, MNEMONIC, INFURA_KEY);

    const accessControls = await HashtagAccessControls.deployed();
    const hashtagProtocol = await HashtagProtocol.deployed();

    await deployer.deploy(ERC721HashtagRegistry, accessControls.address, hashtagProtocol.address, {from: creator});

    console.log('successful!');
};

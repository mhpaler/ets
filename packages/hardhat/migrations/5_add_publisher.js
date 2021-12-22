const {getAccountAddress} = require('@blockrocket/utils');

const MNEMONIC = process.env.PROTOTYPE_BR_KEY || '';
const INFURA_KEY = process.env.PROTOTYPE_BR_INFURA_KEY || '';

const HashtagAccessControls = artifacts.require('HashtagAccessControls');

module.exports = async function (deployer, network, accounts) {
    console.log('Adding publisher to network: ' + network);

    const creator = getAccountAddress(accounts, 0, network, MNEMONIC, INFURA_KEY);

    const accessControls = await HashtagAccessControls.deployed();
    await accessControls.grantRole(ethers.utils.id('PUBLISHER'), creator, {from: creator});

    console.log('successful!');

};

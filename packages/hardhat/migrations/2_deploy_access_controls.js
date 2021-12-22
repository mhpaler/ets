const {getAccountAddress} = require('@blockrocket/utils');

const MNEMONIC = process.env.PROTOTYPE_BR_KEY || '';
const INFURA_KEY = process.env.PROTOTYPE_BR_INFURA_KEY || '';

const HashtagAccessControls = artifacts.require('HashtagAccessControls');

module.exports = async function (deployer, network, accounts) {
    console.log('Deploying HashtagAccessControls to network: ' + network);

    const creator = getAccountAddress(accounts, 0, network, MNEMONIC, INFURA_KEY);

    await deployer.deploy(HashtagAccessControls, {from: creator});
    const accessControls = await HashtagAccessControls.deployed();
    console.log('accessControls.address', accessControls.address);

    console.log('successful!');
};

const {getAccountAddress} = require('@blockrocket/utils');

const MNEMONIC = process.env.PROTOTYPE_BR_KEY || '';
const INFURA_KEY = process.env.PROTOTYPE_BR_INFURA_KEY || '';

const HashtagProtocol = artifacts.require('HashtagProtocol');

module.exports = async function (deployer, network, accounts) {
    console.log('Adding publisher access controls to network: ' + network);

    const creator = getAccountAddress(accounts, 0, network, MNEMONIC, INFURA_KEY);

    const hashtagProtocol = await HashtagProtocol.deployed();

    await hashtagProtocol.mint("#BlockRocket", creator, creator, {from: creator});
    await hashtagProtocol.mint("#HashtagProtocol", creator, creator, {from: creator});

    console.log('successful!');
};

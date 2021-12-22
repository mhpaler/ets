const {getAccountAddress} = require('@blockrocket/utils');

const MNEMONIC = process.env.PROTOTYPE_BR_KEY || '';
const INFURA_KEY = process.env.PROTOTYPE_BR_INFURA_KEY || '';

const ERC721BurnableMock = artifacts.require('ERC721BurnableMock');

module.exports = async function (deployer, network, accounts) {
  console.log('Deploying mock nft to network: ' + network);

  const creator = getAccountAddress(accounts, 0, network, MNEMONIC, INFURA_KEY);

  await deployer.deploy(ERC721BurnableMock, 'NFT', 'NFT', {from: creator});
  const nft = await ERC721BurnableMock.deployed();
  console.log('nft.address', nft.address);

  console.log('successful!');
};

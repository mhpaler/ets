const {ethers, utils} = require('ethers')
const {keccak256, defaultAbiCoder, toUtf8Bytes, solidityPack} = utils

const {ecsign} = require('ethereumjs-util')

const _TAG_TYPEHASH = keccak256(
  toUtf8Bytes('Tag(bytes32 tagParamsHash)')
);

function getSignerPrivateKey(accountName) {

  const namedAccounts = {
    "ETSPublisher": "m/44'/60'/0'/0/1",
    // Named account "Tagger" is account #7.
    "Tagger": "m/44'/60'/0'/0/7",
  };

  if (!namedAccounts[accountName]) {
    throw new Error(`Private key for named signer ${accountName} not found `)
  }

  let mnemonic = process.env.MNEMONIC;
  const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
  return hdNode.derivePath(namedAccounts[accountName]).privateKey;
}

function getDomainSeparator(contractAddress, contractName, contractVersion) {
  return keccak256(
    defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [
        keccak256(
          toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')
        ),
        keccak256(toUtf8Bytes(contractName)),
        keccak256(toUtf8Bytes(contractVersion)),
        31337, // local testnet chain ID
        contractAddress
      ]
    )
  );
}

function getTagStructHash(contractAddress, contractName, contractVersion, taggingRecords) {
  const DOMAIN_SEPARATOR = getDomainSeparator(contractAddress, contractName, contractVersion);

  console.log('num of tagging records', taggingRecords.length)
  const taggingRecordsHash = keccak256(
    defaultAbiCoder.encode(
      ['tuple[](string nftAddress, string tokenId, string chainId, string[] tagStrings, bool ensure)'],
      [taggingRecords]
    )
  )

  return keccak256(
    solidityPack(
      ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
      [
        '0x19',
        '0x01',
        DOMAIN_SEPARATOR,
        keccak256(
          defaultAbiCoder.encode(
            ['bytes32', 'bytes32'],
            [_TAG_TYPEHASH, taggingRecordsHash]
          )
        )
      ]
    )
  );
}

function signTagRequest(contractAddress, contractName, contractVersion, taggingRecords, signerPrivateKey) {
  const messageStructHash = getTagStructHash(
    contractAddress,
    contractName,
    contractVersion,
    taggingRecords
  )

  const {v, r, s} = ecsign(
    Buffer.from(messageStructHash.slice(2), 'hex'), // msg will come with '0x' so strip it off
    Buffer.from(signerPrivateKey.slice(2), 'hex')  // Private key is expected to start with '0x'
  )

  return {v, r, s}
}

module.exports = {
  signTagRequest,
  getSignerPrivateKey
}

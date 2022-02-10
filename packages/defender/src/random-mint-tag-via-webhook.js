// Import dependencies available in the autotask environment
import { ethers } from 'ethers';
import { DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { DefenderRelaySigner } from 'defender-relay-client/lib/ethers';
// import { AutotaskEvent } from 'defender-autotask-utils';

// Import an ABI which will be embedded into the generated js
import HashtagProtocolABI from '../abis/HashtagProtocol.json';
import HashtagAccessControlsABI from '../abis/HashtagAccessControls.json';

// Address of the DAI contract (for this example)
const HashtagProtocolAddress = `0x4a9B519C355568c0aF543c7B476b2d7A8E149fBb`;

export async function main(signer, tag) {

  const hashtagProtocol = new ethers.Contract(HashtagProtocolAddress, HashtagProtocolABI.abi, signer);
  const hashtagAccessControls = new ethers.Contract(await hashtagProtocol.accessControls(), HashtagAccessControlsABI.abi, signer);

  const relayer = await signer.getAddress();

  // Check that relayer is whitelisted.
  if (!await hashtagAccessControls.isPublisher(relayer)) {
    throw `Relayer ${relayer} is not a whitelisted publisher.`;
  }

  // Mint a tag: args are hashtag, publisher, creator.
  // txn contains defender txn info.
  // @see https://docs.openzeppelin.com/defender/relay-api-reference#query-transaction
  const txn = await hashtagProtocol.mint(tag, relayer, relayer);
  return {
    response: `minted ${tag}` // JSON-serialized and included in the `result` field of the response
  };
}

// Entrypoint for the Autotask
export async function handler(event) {

  const {
    body,    // Object with JSON-parsed POST body
    // headers, // Object with key-values from HTTP headers
    // queryParameters, // Object with key-values from query parameters
  } = event.request;

  const tag = body.tag;
  
  // Initialize defender relayer provider and signer
  //const provider = new ethers.providers.AlchemyProvider(network="maticmum", alchemyMumbai);
  
  // Uncomment to use the native defender provider, instead of Alchemy or Infura.
  const provider = new DefenderRelayProvider(event);
  const signer = new DefenderRelaySigner(event, provider, { speed: 'fast' });
  return main(signer, tag);
}

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
  require('dotenv').config();
  const { 
    API_KEY: apiKey, 
    API_SECRET: apiSecret, 
    ALCHEMY_MUMBAI: alchemyMumbai 
  } = process.env;

  // Simulate a POST request to a Defender Autotask Webhook.
  const request = {
    body: { tag: '#mychannel' },
  };

  handler({apiKey, apiSecret, request})
    .then(() => process.exit(0))
    .catch((error) => { console.error(error); process.exit(1); });
}

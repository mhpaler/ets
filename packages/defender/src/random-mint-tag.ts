// Import dependencies available in the autotask environment
import { ethers } from 'ethers';
import { DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { DefenderRelaySigner } from 'defender-relay-client/lib/ethers';
import { AutotaskEvent } from 'defender-autotask-utils';

// Import a dependency not present in the autotask environment which will be included in the js bundle
// @ts-ignore
import { words } from 'random-words';

// Import an ABI which will be embedded into the generated js
import HashtagProtocolABI from '../abis/HashtagProtocol.json';
import HashtagAccessControlsABI from '../abis/HashtagAccessControls.json';

// Address of the DAI contract (for this example)
const HashtagProtocolAddress = `0x4a9B519C355568c0aF543c7B476b2d7A8E149fBb`;

export async function main(signer: DefenderRelaySigner) {

  const hashtagProtocol = new ethers.Contract(HashtagProtocolAddress, HashtagProtocolABI.abi, signer);
  const hashtagAccessControls = new ethers.Contract(await hashtagProtocol.accessControls(), HashtagAccessControlsABI.abi, signer);

  const relayer = await signer.getAddress();

  // Check that relayer is whitelisted.
  if (!await hashtagAccessControls.isPublisher(relayer)) {
    throw `Relayer ${relayer} is not a whitelisted publisher.`;
  }

  // Mint a random tag: args are hashtag, publisher, creator.
  // @see https://www.npmjs.com/package/random-words
  let tag: string = '#' + words();

  // txn contains defender txn info.
  // @see https://docs.openzeppelin.com/defender/relay-api-reference#query-transaction
  const txn = await hashtagProtocol.mint(tag, relayer, relayer);
  console.log(`minted ${tag}`);
}

// Entrypoint for the Autotask
export async function handler(event: AutotaskEvent) {

  // Pull in alchemy node api key from Defender secrets store.
  const { alchemyMumbai } = event.secrets;
  const { AccessKeyId, SecretAccessKey } = JSON.parse(event.credentials);
  const credentials = {
    apiKey: AccessKeyId,
    apiSecret: SecretAccessKey
  };

  // Initialize defender relayer provider and signer
  //const provider = new ethers.providers.AlchemyProvider(network="maticmum", alchemyMumbai);
  
  // Uncomment to use the native defender provider, instead of Alchemy or Infura.
  const provider = new DefenderRelayProvider(credentials);
  const signer = new DefenderRelaySigner(credentials, provider, { speed: 'fast' });
  return main(signer);
}

// Sample typescript type definitions
type EnvInfo = {
  API_KEY: string;
  API_SECRET: string;
  ALCHEMY_MUMBAI: string;
}

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
  require('dotenv').config();
  const { 
    API_KEY: apiKey, 
    API_SECRET: apiSecret, 
    ALCHEMY_MUMBAI: alchemyMumbai 
  } = process.env as EnvInfo;

  const event = {
    credentials: '{"AccessKeyId":"' + apiKey + '","SecretAccessKey":"' + apiSecret + '"}',
    secrets: { "alchemyMumbai": `${alchemyMumbai}` }
  } as AutotaskEvent;

  handler(event)
    .then(() => process.exit(0))
    .catch((error: Error) => { console.error(error); process.exit(1); });
}

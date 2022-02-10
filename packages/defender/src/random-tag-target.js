// Import dependencies available in the autotask environment
import { ethers } from 'ethers';
import { DefenderRelayProvider } from 'defender-relay-client/lib/ethers';
import { DefenderRelaySigner } from 'defender-relay-client/lib/ethers';
// import { AutotaskEvent } from 'defender-autotask-utils';

// Import a dependency not present in the autotask environment which will be included in the js bundle
import { word } from 'random-words';

// Import an ABI which will be embedded into the generated js
import ETSAbi from '../abis/ETS.json';
import ETSAccessControlsAbi from '../abis/ETSAccessControls.json';

// Address of the DAI contract (for this example)
const ETSAddress = `0x99e44e8c4593308dC934aD959d7c8896FE15d9Ed`;

export async function main(signer) {

  const ets = new ethers.Contract(ETSAddress, ETSAbi, signer);
  const etsAccessControls = new ethers.Contract(await ets.accessControls(), ETSAccessControlsAbi, signer);

  const relayer = await signer.getAddress();

  // Check that relayer is whitelisted.
  if (!await etsAccessControls.isPublisher(relayer)) {
    throw `Relayer ${relayer} is not a whitelisted publisher.`;
  }

  // Tag a target: args are tag, hashtag, publisher, creator.
  // @see https://www.npmjs.com/package/random-words
  let tag = '#' + word();

  // txn contains defender txn info.
  // @see https://docs.openzeppelin.com/defender/relay-api-reference#query-transaction
  // function tagTarget(
  //   string calldata _tagString,
  //   string calldata _targetType,
  //   string calldata _targetURI,
  //   address payable _publisher,
  //   address _tagger)
  let taggingFee = await ets.taggingFee();
  taggingFee = taggingFee.toString();
  const targetURI = "0x8ee9a60cb5c0e7db414031856cb9e0f1f05988d1|3061|1";
  const targetType = "nft";
  
  const txn = await ets.tagTarget(tag, targetType, targetURI, relayer, relayer, { value: taggingFee });
  console.log(`${targetType}|${targetURI} tagged with ${tag}`);
}

// Entrypoint for the Autotask
export async function handler(event) {

  // Pull in alchemy node api key from Defender secrets store.
  // const { alchemyMumbai } = event.secrets;
  // const { AccessKeyId, SecretAccessKey } = JSON.parse(event.credentials);
  // const credentials = {
  //   apiKey: AccessKeyId,
  //   apiSecret: SecretAccessKey
  // };

  // Initialize defender relayer provider and signer
  //const provider = new ethers.providers.AlchemyProvider(network="maticmum", alchemyMumbai);
  
  // Uncomment to use the native defender provider, instead of Alchemy or Infura.
  const provider = new DefenderRelayProvider(event);
  const signer = new DefenderRelaySigner(event, provider, { speed: 'fast' });
  return main(signer);
}

// Sample typescript type definitions
// type EnvInfo = {
//   API_KEY: string;
//   API_SECRET: string;
//   ALCHEMY_MUMBAI: string;
// }

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
  require('dotenv').config();
  const { 
    API_KEY: apiKey, 
    API_SECRET: apiSecret, 
    ALCHEMY_MUMBAI: alchemyMumbai 
  } = process.env;

  const event = {
    credentials: '{"AccessKeyId":"' + apiKey + '","SecretAccessKey":"' + apiSecret + '"}',
    secrets: { "alchemyMumbai": `${alchemyMumbai}` }
  };

  handler({apiKey, apiSecret})
    .then(() => process.exit(0))
    .catch((error) => { console.error(error); process.exit(1); });
}

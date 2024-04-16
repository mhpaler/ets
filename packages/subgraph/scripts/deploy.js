const { execSync } = require('child_process');
const axios = require('axios');
const minimist = require('minimist');

function runCommand(command) {
  console.log(`Executing: ${command}`);
  execSync(command, { stdio: 'inherit' });
}

async function checkGraphIsRunning() {
  // Skip the check for non-local deployments
  if (deployment !== 'localhost') {
    return true;
  }

  console.log('Checking if local Graph Node is running...');
  try {
    await axios.post('http://localhost:8020', {});
    console.log('Local Graph Node is running.');
    return true;
  } catch (error) {
    console.error('Local Graph Node is not running or not ready.');
    console.error('Please ensure Docker is running and then start the Graph Node using the command: "pnpm run-graph-node".');
    console.error('After the Graph Node has started, you can rerun this deployment script.');
    return false;
  }
}

async function shipLocal() {
  if (!await checkGraphIsRunning()) {
    return;
  }

  runCommand("node scripts/generate-yaml.js --deployment localhost");
  runCommand("graph codegen --output-dir src/generated");
  runCommand("graph build");
  runCommand("graph remove --node http://localhost:8020/ ets/ets-local");
  runCommand("graph create --node http://localhost:8020/ ets/ets-local");
  runCommand("graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 ets/ets-local --version-label dev");
}

function deployTestnetProduction() {
  runCommand("node scripts/generate-yaml.js --deployment testnet_production");
  runCommand("graph codegen --output-dir src/generated");
  runCommand("graph deploy --product hosted-service ethereum-tag-service/ets-testnet-production");
}

function deployTestnetStage() {
  runCommand("node scripts/generate-yaml.js --deployment testnet_stage");
  runCommand("graph codegen --output-dir src/generated");
  runCommand("graph deploy --studio blah");

  //  runCommand("graph deploy --product hosted-service ethereum-tag-service/ets-testnet-stage");
}

const argv = minimist(process.argv.slice(2));
const deployment = argv.deployment || argv.d;

if (deployment === "localhost") {
  shipLocal();
} else if (deployment === "testnet_production") {
  deployTestnetProduction();
} else if (deployment === "testnet_stage") {
  deployTestnetStage();
} else {
  console.error(`Unknown deployment target: '${deployment}'.`);
  console.error(`Please use a valid deployment target such as 'localhost', 'testnet_production', or 'testnet_stage'.`);
  console.error(`To deploy, use the command: 'pnpm graph-deploy --deployment [target]' or 'pnpm graph-deploy -d [target]', where [target] is the deployment target.`);
}

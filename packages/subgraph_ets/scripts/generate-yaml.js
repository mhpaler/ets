/**
 * Generate subgraph.yaml file automatically.
 *
 * Usage: ./generate-yaml.js --deployment [target]
 * Where [target] is the destination the subgraph.
 */
const artifactsPath = "./../hashtag-contracts/.deployer";
const fs = require("fs-extra");
const Handlebars = require("handlebars");

const args = process.argv.slice(2);
const target = args[1];

if (!target) {
  console.error(`missing --deployment [target] argument`);
  return;
}

const deploymentTargets = {
  mainnet: {
    chainId: 1,
    network: "mainnet",
  },
  mumbai: {
    chainId: 80001,
    network: "mumbai",
  },
  localhost: {
    chainId: 31337,
    network: "mainnet", // Subgraph localhost uses "mainnet"
  },
};

if (!deploymentTargets[target]) {
  console.log(`deployment target ${target} not known`);
  return;
}

const chainId = deploymentTargets[target].chainId;
const artifactPath = `${artifactsPath}/${chainId}.json`;
let deploymentArtifact;
try {
  deploymentArtifact = JSON.parse(fs.readFileSync(artifactPath).toString());
} catch (err) {
  if (err.code === "ENOENT") {
    console.log("File not found!");
  } else {
    throw err;
  }
}

const contractsInfo = {
  contracts: deploymentArtifact.contracts,
  network: deploymentTargets[target].network,
};
const template = Handlebars.compile(fs.readFileSync("./templates/subgraph.yaml").toString());
const result = template(contractsInfo);
fs.writeFileSync("./subgraph.yaml", result);

console.log(target + " configuration file written to /hashtag-subgraph/subgraph.yaml");

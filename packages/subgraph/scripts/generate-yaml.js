const fs = require("fs-extra");
const Handlebars = require("handlebars");

const networks = {
  localhost: {
    name: "mainnet", // localhost subgraph uses name of "mainnet"
    configPath: "./../contracts/export/chainConfig/localhost.json",
    upgradesConfigPath: "./../contracts/export/upgradeConfig/localhost.json",
    abis: {
      ETS: "./../contracts/deployments/localhost/ETS.json",
      ETSAccessControls: "./../contracts/deployments/localhost/ETSAccessControls.json",
      ETSAuctionHouse: "./../contracts/deployments/localhost/ETSAuctionHouse.json",
      ETSEnrichTarget: "./../contracts/deployments/localhost/ETSEnrichTarget.json",
      ETSRelayerFactory: "./../contracts/deployments/localhost/ETSRelayerFactory.json",
      ETSRelayerV1: "./../contracts/deployments/localhost/ETSRelayerV1.json",
      ETSTarget: "./../contracts/deployments/localhost/ETSTarget.json",
      ETSToken: "./../contracts/deployments/localhost/ETSToken.json",
    },
  },
  testnet_production: {
    name: "arbitrum-sepolia", // subgraph chain
    configPath: "./../contracts/export/chainConfig/testnet_production.json",
    upgradesConfigPath: "./../contracts/export/upgradeConfig/testnet_production.json",
    abis: {
      ETS: "./../contracts/deployments/testnet_production/ETS.json",
      ETSAccessControls: "./../contracts/deployments/testnet_production/ETSAccessControls.json",
      ETSAuctionHouse: "./../contracts/deployments/testnet_production/ETSAuctionHouse.json",
      ETSEnrichTarget: "./../contracts/deployments/testnet_production/ETSEnrichTarget.json",
      ETSRelayerFactory: "./../contracts/deployments/testnet_production/ETSRelayerFactory.json",
      ETSRelayerV1: "./../contracts/deployments/testnet_production/ETSRelayerV1.json",
      ETSTarget: "./../contracts/deployments/testnet_production/ETSTarget.json",
      ETSToken: "./../contracts/deployments/testnet_production/ETSToken.json",
    },
  },
  testnet_stage: {
    name: "arbitrum-sepolia", // subgraph chain
    configPath: "./../contracts/export/chainConfig/testnet_stage.json",
    upgradesConfigPath: "./../contracts/export/upgradeConfig/testnet_stage.json",
    abis: {
      ETS: "./../contracts/deployments/testnet_stage/ETS.json",
      ETSAccessControls: "./../contracts/deployments/testnet_stage/ETSAccessControls.json",
      ETSAuctionHouse: "./../contracts/deployments/testnet_stage/ETSAuctionHouse.json",
      ETSEnrichTarget: "./../contracts/deployments/testnet_stage/ETSEnrichTarget.json",
      ETSRelayerFactory: "./../contracts/deployments/testnet_stage/ETSRelayerFactory.json",
      ETSRelayerV1: "./../contracts/deployments/testnet_stage/ETSRelayerV1.json",
      ETSTarget: "./../contracts/deployments/testnet_stage/ETSTarget.json",
      ETSToken: "./../contracts/deployments/testnet_stage/ETSToken.json",
    },
  },
};

const openzeppelinAbis = {
  Ownable: "./../contracts/abi/@openzeppelin/contracts/access/Ownable.sol/Ownable.json",
  Pausable: "./../contracts/abi/@openzeppelin/contracts/security/Pausable.sol/Pausable.json",
  UUPSUpgradeable:
    "./../contracts/abi/@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol/UUPSUpgradeable.json",
  Initializable:
    "./../contracts/abi/@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol/Initializable.json",
};

const args = process.argv.slice(2);
const network = args[1];

if (!network) {
  console.error("missing --deployment [network] argument");
}

if (!networks[network]) {
  console.info(`target network ${network} not known`);
}

// Load network-specific files
try {
  networks[network].config = JSON.parse(fs.readFileSync(networks[network].configPath).toString());
  networks[network].upgradesConfig = JSON.parse(fs.readFileSync(networks[network].upgradesConfigPath).toString());
} catch (err) {
  console.error(`Error loading files for network ${network}:`, err.message);
}

const template = Handlebars.compile(fs.readFileSync("./templates/subgraph.yaml.mustache").toString());
const result = template({ ...networks[network], openzeppelin: openzeppelinAbis });

fs.writeFileSync("./subgraph.yaml", result);
console.info(`${network} configuration file written to /subgraph/subgraph.yaml`);

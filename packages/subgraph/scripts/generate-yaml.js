const fs = require("fs-extra");
const Handlebars = require("handlebars");

const networks = {
  localhost: {
    name: "mainnet",
    configPath: "./../contracts/deployments/localhost/config.json",
    upgradesConfigPath: "./../contracts/deployments/localhost/upgradesConfig.json",
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
  mumbai: {
    name: "mumbai",
    configPath: "./../contracts/deployments/mumbai/config.json",
    upgradesConfigPath: "./../contracts/deployments/mumbai/upgradesConfig.json",
    abis: {
      ETS: "./../contracts/deployments/mumbai/ETS.json",
      ETSAccessControls: "./../contracts/deployments/mumbai/ETSAccessControls.json",
      ETSAuctionHouse: "./../contracts/deployments/mumbai/ETSAuctionHouse.json",
      ETSEnrichTarget: "./../contracts/deployments/mumbai/ETSEnrichTarget.json",
      ETSRelayerFactory: "./../contracts/deployments/mumbai/ETSRelayerFactory.json",
      ETSRelayerV1: "./../contracts/deployments/mumbai/ETSRelayerV1.json",
      ETSTarget: "./../contracts/deployments/mumbai/ETSTarget.json",
      ETSToken: "./../contracts/deployments/mumbai/ETSToken.json",
    }
  },
  mumbai_stage: {
    name: "mumbai",
    configPath: "./../contracts/deployments/mumbai_stage/config.json",
    upgradesConfigPath: "./../contracts/deployments/mumbai_stage/upgradesConfig.json",
    abis: {
      ETS: "./../contracts/deployments/mumbai_stage/ETS.json",
      ETSAccessControls: "./../contracts/deployments/mumbai_stage/ETSAccessControls.json",
      ETSAuctionHouse: "./../contracts/deployments/mumbai_stage/ETSAuctionHouse.json",
      ETSEnrichTarget: "./../contracts/deployments/mumbai_stage/ETSEnrichTarget.json",
      ETSRelayerFactory: "./../contracts/deployments/mumbai_stage/ETSRelayerFactory.json",
      ETSRelayerV1: "./../contracts/deployments/mumbai_stage/ETSRelayerV1.json",
      ETSTarget: "./../contracts/deployments/mumbai_stage/ETSTarget.json",
      ETSToken: "./../contracts/deployments/mumbai_stage/ETSToken.json",
    }
  },
};

const openzeppelinAbis = {
  Ownable: "./../contracts/abi/@openzeppelin/contracts/access/Ownable.sol/Ownable.json",
  Pausable: "./../contracts/abi/@openzeppelin/contracts/security/Pausable.sol/Pausable.json",
  UUPSUpgradeable: "./../contracts/abi/@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol/UUPSUpgradeable.json",
  Initializable: "./../contracts/abi/@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol/Initializable.json",
}

const args = process.argv.slice(2);
const network = args[1];

if (!network) {
  console.error(`missing --deployment [network] argument`);
  return;
}

if (!networks[network]) {
  console.log(`target network ${network} not known`);
  return;
}

// Load network-specific files
try {
  networks[network].config = JSON.parse(fs.readFileSync(networks[network].configPath).toString());
  networks[network].upgradesConfig = JSON.parse(fs.readFileSync(networks[network].upgradesConfigPath).toString());
} catch (err) {
  console.error(`Error loading files for network ${network}:`, err.message);
  return;
}

const template = Handlebars.compile(fs.readFileSync("./templates/subgraph.yaml.mustache").toString());
const result = template({ ...networks[network], openzeppelin: openzeppelinAbis });

fs.writeFileSync("./subgraph.yaml", result);
console.log(network + " configuration file written to /subgraph/subgraph.yaml");


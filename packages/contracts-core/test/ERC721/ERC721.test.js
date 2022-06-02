const { artifacts } = require("hardhat");

const { shouldBehaveLikeERC721, shouldBehaveLikeERC721Metadata } = require("./behaviors/ERC721.behavior");
const { shouldBehaveLikeERC721Pausable } = require("./behaviors/ERC721Pausable.behavior");
const { shouldBehaveLikeERC721Burnable } = require("./behaviors/ERC721Burnable.behavior");
const ETSAccessControls = artifacts.require("ETSAccessControls");
const ETSLifeCycleControls = artifacts.require("ETSLifeCycleControls");
const ETS = artifacts.require("ETS");

contract("ERC721", function (accounts) {
  const [ETSAdmin, ETSPublisher] = accounts;

  beforeEach(async function () {
    this.accessControls = await ETSAccessControls.new({ from: ETSAdmin });
    await this.accessControls.initialize();
    await this.accessControls.grantRole(await this.accessControls.SMART_CONTRACT_ROLE(), ETSAdmin, {
      from: ETSAdmin,
    });

    // add a publisher to the protocol
    await this.accessControls.grantRole(ethers.utils.id("PUBLISHER"), ETSPublisher);

    this.lifeCycleControls = await ETSLifeCycleControls.new();
    await this.lifeCycleControls.initialize(this.accessControls.address);

    this.token = await ETS.new();
    await this.token.initialize(this.accessControls.address, this.lifeCycleControls.address, ETSAdmin);
    
    await this.lifeCycleControls.setETS(this.token.address);
  });

  const name = "Ethereum Tag Service";
  const symbol = "CTAG";

  shouldBehaveLikeERC721("ERC721", ...accounts);
  shouldBehaveLikeERC721Pausable("ERC721", ...accounts);
  //shouldBehaveLikeERC721Burnable("ERC721", ...accounts);
  shouldBehaveLikeERC721Metadata("ERC721", name, symbol, ...accounts);
});

const { artifacts } = require("hardhat");

const { shouldBehaveLikeERC721, shouldBehaveLikeERC721Metadata } = require("./behaviors/ERC721.behavior");
const { shouldBehaveLikeERC721Pausable } = require("./behaviors/ERC721Pausable.behavior");
const { shouldBehaveLikeERC721Burnable } = require("./behaviors/ERC721Burnable.behavior");
const HashtagAccessControls = artifacts.require("HashtagAccessControls");
const HashtagProtocol = artifacts.require("HashtagProtocol");

contract("ERC721", function (accounts) {
  const [accountHashtagAdmin, accountHashtagPublisher] = accounts;

  beforeEach(async function () {
    this.accessControls = await HashtagAccessControls.new({ from: accountHashtagAdmin });
    await this.accessControls.initialize();
    await this.accessControls.grantRole(await this.accessControls.SMART_CONTRACT_ROLE(), accountHashtagAdmin, {
      from: accountHashtagAdmin,
    });

    // add a publisher to the protocol
    await this.accessControls.grantRole(ethers.utils.id("PUBLISHER"), accountHashtagPublisher);

    this.token = await HashtagProtocol.new();
    await this.token.initialize(this.accessControls.address, accountHashtagAdmin);
  });

  const name = "Hashtag Protocol";
  const symbol = "HASHTAG";

  shouldBehaveLikeERC721("ERC721", ...accounts);
  shouldBehaveLikeERC721Pausable("ERC721", ...accounts);
  shouldBehaveLikeERC721Burnable("ERC721", ...accounts);
  shouldBehaveLikeERC721Metadata("ERC721", name, symbol, ...accounts);
});

const {artifacts} = require("hardhat");
const {getInitSettings} = require("./../setup.js");
const {shouldBehaveLikeERC721, shouldBehaveLikeERC721Metadata} = require("./behaviors/ERC721.behavior");
const {shouldBehaveLikeERC721Pausable} = require("./behaviors/ERC721Pausable.behavior");
const {shouldBehaveLikeERC721Burnable} = require("./behaviors/ERC721Burnable.behavior");
const ETSAccessControls = artifacts.require("ETSAccessControls");
const ETSToken = artifacts.require("ETSToken");

contract("ERC721", function (accounts) {
  const [ETSAdmin, ETSPlatform] = accounts;
  const initSettings = getInitSettings();

  beforeEach(async function () {
    // Openzeppelin ERC721 tests use a Truffle configuration
    // so we can't reuse setup.js for these tests.
    this.accessControls = await ETSAccessControls.new({from: ETSAdmin});
    await this.accessControls.initialize(initSettings.PUBLISHER_DEFAULT_THRESHOLD);

    this.token = await ETSToken.new();
    await this.token.initialize(
      this.accessControls.address,
      initSettings.TAG_MIN_STRING_LENGTH,
      initSettings.TAG_MAX_STRING_LENGTH,
      initSettings.OWNERSHIP_TERM_LENGTH,
    );

    await this.accessControls.grantRole(await this.accessControls.SMART_CONTRACT_ROLE(), ETSAdmin, {from: ETSAdmin});

    // Set Core Dev Team address as "platform" address. In production this will be a multisig.
    await this.accessControls.setPlatform(ETSPlatform);

    // Not exactly sure why, but with these truffle tests I need to grant publisher role to the deployer.
    await this.accessControls.grantRole(ethers.utils.id("PUBLISHER"), ETSAdmin);

    // Grant DEFAULT_ADMIN_ROLE to platform
    // Plan here is to transfer admin control to
    // platform multisig after deployment
    await this.accessControls.grantRole(await this.accessControls.DEFAULT_ADMIN_ROLE(), ETSPlatform);

    // Grant PUBLISHER role to platform
    await this.accessControls.grantRole(ethers.utils.id("PUBLISHER"), ETSPlatform);

    // Set PUBLISHER role admin.
    // Contracts or addresses given PUBLISHER_ADMIN role
    // can grant PUBLISHER role. This role
    // should be given to ETSAccessControls so it can
    // grant PUBLISHER role.
    await this.accessControls.setRoleAdmin(ethers.utils.id("PUBLISHER"), ethers.utils.id("PUBLISHER_ADMIN"));

    // Grant PUBLISHER_ADMIN role to ETSToken contract
    await this.accessControls.grantRole(ethers.utils.id("PUBLISHER_ADMIN"), this.token.address);

    // Set token access controls on ETSAccessControls.
    await this.accessControls.setETSToken(this.token.address);

    // Approve auction house contract to move tokens owned by platform.
    // await ETSToken.setApprovalForAll(ETSAuctionHouse.address, true);
  });

  const name = "Ethereum Tag Service";
  const symbol = "CTAG";

  shouldBehaveLikeERC721("ERC721", ...accounts);
  shouldBehaveLikeERC721Pausable("ERC721", ...accounts);
  shouldBehaveLikeERC721Burnable("ERC721", ...accounts);
  shouldBehaveLikeERC721Metadata("ERC721", name, symbol, ...accounts);
});

const {BN, constants, expectEvent, expectRevert} = require("@openzeppelin/test-helpers");
const {expect} = require("chai");
const {ZERO_ADDRESS} = constants;

const tag1 = "#TokenizeEverything";
const tag2 = "#trustless";
const firstTokenId = "26056379909737856550015515958401490153572348305968831462962556214796192847542";
const secondTokenId = "38593528540894169991277332302023612800646425531175410200147135177119611307149";
const unknownTokenId = new BN("999999999");

let receipt;

function shouldBehaveLikeERC721Burnable(
  errorPrefix,
  deployer,
  owner,
  operator,
  approved,
  anotherApproved,
  other,
  newOwner,
  creator,
) {
  context("like a burnable ERC721", function () {
    beforeEach(async function () {
      await this.token.createTag(tag1, creator);
      await this.token.createTag(tag2, creator);
    });

    describe("burn", function () {
      const tokenId = firstTokenId;

      describe("when successful", function () {
        beforeEach(async function () {
          receipt = await this.token.burn(tokenId, {from: owner});
        });

        it("burns the given token ID and adjusts the balance of the owner", async function () {
          await expectRevert(this.token.ownerOf(tokenId), "ERC721: owner query for nonexistent token");
          expect(await this.token.balanceOf(owner)).to.be.bignumber.equal("1");
        });

        it("emits a burn event", async function () {
          expectEvent(receipt, "Transfer", {
            from: owner,
            to: ZERO_ADDRESS,
            tokenId: tokenId,
          });
        });
      });

      describe("when there is a previous approval burned", function () {
        beforeEach(async function () {
          await this.token.approve(approved, tokenId, {from: owner});
          receipt = await this.token.burn(tokenId, {from: owner});
        });

        context("getApproved", function () {
          it("reverts", async function () {
            await expectRevert(this.token.getApproved(tokenId), "ERC721: approved query for nonexistent token");
          });
        });
      });

      describe("when the given token ID was not tracked by this contract", function () {
        it("reverts", async function () {
          await expectRevert(
            this.token.burn(unknownTokenId, {from: owner}),
            "ERC721: owner query for nonexistent token",
          );
        });
      });

      describe("when attempted by non-administrator", function () {
        it("reverts", async function () {
          await this.token.transferFrom(owner, newOwner, firstTokenId, {from: owner});
          expect(await this.token.balanceOf(owner)).to.be.bignumber.equal("1");
          expect(await this.token.balanceOf(newOwner)).to.be.bignumber.equal("1");
          await expectRevert(this.token.burn(firstTokenId, {from: newOwner}), "Caller must have administrator access");
        });
      });
    });
  });
}

module.exports = {
  shouldBehaveLikeERC721Burnable,
};

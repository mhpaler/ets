const { constants, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const { ZERO_ADDRESS } = constants;

const tag = "#tokenize";
const firstTokenId = "15318105376098803643693821590273941289334768905701457798908674577654908912688";
const mockData = "0x42";

function shouldBehaveLikeERC721Pausable(
  errorPrefix,
  owner,
  publisher,
  operator,
  approved,
  anotherApproved,
  other,
  newOwner,
  creator,
) {
  context("when token is paused", function () {
    beforeEach(async function () {
      await this.token.methods["createTag(string)"](tag);
      await this.token.pause();
    });

    it("reverts when trying to transferFrom", async function () {
      await expectRevert(this.token.transferFrom(owner, newOwner, firstTokenId, { from: owner }), "Pausable: paused");
    });

    it("reverts when trying to safeTransferFrom", async function () {
      await expectRevert(
        this.token.safeTransferFrom(owner, newOwner, firstTokenId, { from: owner }),
        "Pausable: paused",
      );
    });

    it("reverts when trying to safeTransferFrom with data", async function () {
      await expectRevert(
        this.token.methods["safeTransferFrom(address,address,uint256,bytes)"](owner, newOwner, firstTokenId, mockData, {
          from: owner,
        }),
        "Pausable: paused",
      );
    });

    it("reverts when trying to mint", async function () {
      await expectRevert(this.token.methods["createTag(string)"]("#trustless"), "Pausable: paused");
    });

    it("reverts when trying to burn", async function () {
      await expectRevert(this.token.burn(firstTokenId), "Pausable: paused");
    });

    it("transfers after unpause", async function () {
      await expectRevert(
        this.token.safeTransferFrom(owner, newOwner, firstTokenId, { from: owner }),
        "Pausable: paused",
      );
      await this.token.unPause();
      await this.token.safeTransferFrom(owner, newOwner, firstTokenId, { from: owner }),
        expect(await this.token.ownerOf(firstTokenId)).to.be.equal(newOwner);
    });

    describe("getApproved", function () {
      it("returns approved address", async function () {
        const approvedAccount = await this.token.getApproved(firstTokenId);
        expect(approvedAccount).to.equal(ZERO_ADDRESS);
      });
    });

    describe("balanceOf", function () {
      it("returns the amount of tokens owned by the given address", async function () {
        const balance = await this.token.balanceOf(owner);
        expect(balance).to.be.bignumber.equal("1");
      });
    });

    describe("ownerOf", function () {
      it("returns the amount of tokens owned by the given address", async function () {
        const ownerOfToken = await this.token.ownerOf(firstTokenId);
        expect(ownerOfToken).to.equal(owner);
      });
    });

    describe("exists", function () {
      it("returns token existence", async function () {
        expect(await this.token.tokenIdExists(firstTokenId)).to.equal(true);
      });
    });

    describe("isApprovedForAll", function () {
      it("returns the approval of the operator", async function () {
        expect(await this.token.isApprovedForAll(owner, operator)).to.equal(false);
      });
    });
  });
}

module.exports = {
  shouldBehaveLikeERC721Pausable,
};

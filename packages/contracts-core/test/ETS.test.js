const {setup, getFactories} = require("./setup.js");
const {ethers, upgrades} = require("hardhat");
const {expect} = require("chai");
const {constants} = ethers;

let targetURI, targetId, taggingRecordId;

describe("ETS Core tests", function () {
  beforeEach("Setup test", async function () {
    [accounts, contracts, initSettings] = await setup();

    taggingFee = await contracts.ETS.taggingFee();
    taggingFee = taggingFee.toString();

    // Grant RandomOne publisher role.
    await contracts.ETSAccessControls.connect(accounts.ETSPlatform).grantRole(
      await contracts.ETSAccessControls.PUBLISHER_ROLE(),
      accounts.RandomOne.address,
    );

    // Mint a tag. RandomOne is Publisher, Creator is Creator. Retained by platform.
    etsOwnedTag = "#Love";
    await contracts.ETSToken.connect(accounts.RandomOne)["createTag(string,address)"](
      etsOwnedTag,
      accounts.Creator.address,
    );
    etsOwnedTagId = await contracts.ETSToken.computeTagId(etsOwnedTag);
    etsOwnedTagId = etsOwnedTagId.toString();

    // Mint another tag. RandomOne is Publisher, Creator is Creator. Transferred to (owned by) RandomTwo.
    userOwnedTag = "#Incredible";
    await contracts.ETSToken.connect(accounts.RandomOne)["createTag(string,address)"](
      userOwnedTag,
      accounts.Creator.address,
    );
    userOwnedTagId = await contracts.ETSToken.computeTagId(userOwnedTag);
    userOwnedTagId = userOwnedTagId.toString();

    await contracts.ETSToken.connect(accounts.ETSPlatform).transferFrom(
      accounts.ETSPlatform.address,
      accounts.RandomTwo.address,
      userOwnedTagId,
    );

    // Add a target to ETS.
    targetURI = "https://google.com";
    await contracts.ETSTarget.connect(accounts.RandomOne).getOrCreateTargetId(targetURI);
    expect(await contracts.ETSTarget["targetExists(string)"](targetURI)).to.be.equal(true);
    targetId = await contracts.ETSTarget.computeTargetId(targetURI);
    //targetId = targetId.toString();

    // Here we are adding the platform as a target tagger for testing purposes.
    await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addTargetTagger(
      accounts.ETSPlatform.address,
      "ETSPlatform",
    );
  });

  describe("Valid setup", async function () {
    it("should have Access controls set to ETSAccessControls contract", async function () {
      expect(await contracts.ETS.etsAccessControls()).to.be.equal(contracts.ETSAccessControls.address);
    });
    it("should have Token set to ETSToken contract", async function () {
      expect(await contracts.ETS.etsToken()).to.be.equal(contracts.ETSToken.address);
    });
    it("should have Target set to ETSTarget contract", async function () {
      expect(await contracts.ETS.etsTarget()).to.be.equal(contracts.ETSTarget.address);
    });
  });

  describe("Setting access controls", async () => {
    it("should revert if set to zero address", async function () {
      await expect(
        contracts.ETS.connect(accounts.ETSPlatform).setAccessControls(constants.AddressZero),
      ).to.be.revertedWith("Address cannot be zero");
    });

    it("should revert if caller is not administrator", async function () {
      await expect(contracts.ETS.connect(accounts.RandomTwo).setAccessControls(accounts.RandomOne.address)).to.be
        .reverted;
    });

    it("should revert if a access controls is set to a non-access control contract", async function () {
      await expect(contracts.ETS.connect(accounts.ETSPlatform).setAccessControls(accounts.RandomTwo.address)).to.be
        .reverted;
    });

    it("should revert if caller is not set as admin in contract being set.", async function () {
      factories = await getFactories();
      const ETSAccessControlsNew = await upgrades.deployProxy(factories.ETSAccessControls, [], {kind: "uups"});

      // ETS Platform is not set as admin in access controls.
      await expect(
        contracts.ETS.connect(accounts.ETSPlatform).setAccessControls(ETSAccessControlsNew.address),
      ).to.be.revertedWith("Caller not admin in new contract");
    });

    it("should emit AccessControlsSet", async function () {
      factories = await getFactories();
      const ETSAccessControlsNew = await upgrades.deployProxy(factories.ETSAccessControls, [], {kind: "uups"});

      await expect(contracts.ETS.connect(accounts.ETSAdmin).setAccessControls(ETSAccessControlsNew.address))
        .to.emit(contracts.ETS, "AccessControlsSet")
        .withArgs(ETSAccessControlsNew.address);
      expect(await contracts.ETS.etsAccessControls()).to.be.equal(ETSAccessControlsNew.address);
    });
  });

  describe("Setting tagging fee", async () => {
    it("should revert if caller is not administrator", async function () {
      await expect(contracts.ETS.connect(accounts.RandomTwo).setTaggingFee(0)).to.be.reverted;
    });

    it("should emit TaggingFeeSet", async function () {
      await expect(contracts.ETS.connect(accounts.ETSPlatform).setTaggingFee(1))
        .to.emit(contracts.ETS, "TaggingFeeSet")
        .withArgs(1);

      expect(await contracts.ETS.taggingFee()).to.be.equal(1);
    });
  });

  describe("Setting tagging fee distribution percentages", async () => {
    it("should revert if caller is not administrator", async function () {
      await expect(contracts.ETS.connect(accounts.RandomTwo).setPercentages(10, 10)).to.be.reverted;
    });
    it("should revert if total percentage is over 100%", async function () {
      await expect(contracts.ETS.connect(accounts.ETSPlatform).setPercentages(60, 60)).to.be.revertedWith(
        "percentages must not be over 100",
      );
    });

    it("should emit PercentagesSet", async function () {
      await expect(contracts.ETS.connect(accounts.ETSPlatform).setPercentages(30, 30))
        .to.emit(contracts.ETS, "PercentagesSet")
        .withArgs(30, 30);

      expect(await contracts.ETS.platformPercentage()).to.be.equal(30);
      expect(await contracts.ETS.publisherPercentage()).to.be.equal(30);
    });
  });

  describe("Writing a tagging record directly to the ETS Core", async () => {
    it("should revert when tagger is not an enabled Target Tagger", async function () {
      await expect(
        contracts.ETS.connect(accounts.RandomOne).tagTarget([12345], 12345, "bookmark", accounts.RandomOne.address),
      ).to.be.revertedWith("Only IETSTargetTagger contracts may call ETS core");
    });

    it("should revert when no tags are supplied", async function () {
      await expect(
        contracts.ETS.connect(accounts.ETSPlatform).tagTarget([], targetId, "bookmark", accounts.RandomOne.address),
      ).to.be.revertedWith("No tags supplied");
    });

    it("should revert when record type is too long", async function () {
      await expect(
        contracts.ETS.connect(accounts.ETSPlatform).tagTarget(
          [etsOwnedTagId],
          targetId,
          "reallyReallyreallyReallyreallyReallyreallyReallyreallyReallyLongRecordType",
          accounts.RandomOne.address,
          {
            value: ethers.BigNumber.from(taggingFee).mul("1"),
          },
        ),
      ).to.be.revertedWith("Record type too long");
    });

    it("should revert when insufficient tagging fee is supplied", async function () {
      await expect(
        contracts.ETS.connect(accounts.ETSPlatform).tagTarget(
          [etsOwnedTagId, userOwnedTagId],
          targetId,
          "bookmark",
          accounts.RandomOne.address,
          {
            value: ethers.BigNumber.from(taggingFee).mul("1"),
          },
        ),
      ).to.be.revertedWith("Insufficient tagging fee supplied");
    });

    it("should emit TargetTagged when successful", async function () {
      const tags = [etsOwnedTagId, userOwnedTagId];
      const tx = await contracts.ETS.connect(accounts.ETSPlatform).tagTarget(
        tags,
        targetId,
        "bookmark",
        accounts.RandomOne.address,
        {
          value: ethers.BigNumber.from(taggingFee).mul("2"),
        },
      );
      await expect(tx).to.emit(contracts.ETS, "TargetTagged");
    });
  });

  describe("Writing a tagging record via a Target Tagger contract", async () => {
    it("should revert when Target Tagger is paused", async function () {
      expect(
        await contracts.ETSAccessControls.isTargetTaggerAndNotPaused(contracts.ETSTargetTagger.address),
      ).to.be.equal(true);

      // Pause ETSTargetTagger
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsTargetTaggerPaused(
        contracts.ETSTargetTagger.address,
      );

      const tagParams = {
        targetURI: targetURI,
        tagStrings: ["#love", "#hate"],
        recordType: "bookmark",
        enrich: false,
      };
      const taggingRecords = [tagParams];
      await expect(
        contracts.ETSTargetTagger.connect(accounts.RandomOne).tagTarget(taggingRecords, {
          value: ethers.BigNumber.from(taggingFee).mul("2"),
        }),
      ).to.be.revertedWith("Only IETSTargetTagger contracts may call ETS core");
    });

    it('should emit "TargetTagged" when successful', async function () {
      const tagParams = {
        targetURI: targetURI,
        tagStrings: ["#love", "#hate"],
        recordType: "bookmark",
        enrich: false,
      };
      const taggingRecords = [tagParams];

      const tx = await contracts.ETSTargetTagger.connect(accounts.RandomOne).tagTarget(taggingRecords, {
        value: ethers.BigNumber.from(taggingFee).mul("2"),
      });
      await expect(tx).to.emit(contracts.ETS, "TargetTagged");
    });
  });

  describe("A tagging record", async () => {
    beforeEach("create a tagging record", async () => {
      // First confirm there's no pre-existing tagging record for this composite key.
      let taggingRecord = await contracts.ETS.getTaggingRecord(
        targetId,
        "bookmark",
        contracts.ETSTargetTagger.address,
        accounts.RandomOne.address,
      );
      expect(taggingRecord.targetId).to.be.equal(0);

      // Create new tagging record.
      const tagParams = {
        targetURI: targetURI, // "https://google.com"
        tagStrings: ["#dex", "#ethereum"],
        recordType: "bookmark",
        enrich: false,
      };
      const taggingRecords = [tagParams];
      // RandomOne is tagger, ETSTargetTagger is publisher.
      await contracts.ETSTargetTagger.connect(accounts.RandomOne).tagTarget(taggingRecords, {
        value: ethers.BigNumber.from(taggingFee).mul("2"),
      });

      // Store tagging record Id for use in tests.
      taggingRecordId = await contracts.ETS.computeTaggingRecordId(
        targetId,
        "bookmark",
        contracts.ETSTargetTagger.address,
        accounts.RandomOne.address,
      );
    });

    it("should properly record the input values", async function () {
      // check that new tagging record values are same as input values (tagParams).
      const taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
      expect(taggingRecord.targetId.toString()).to.be.equal(targetId);
      expect(taggingRecord.recordType).to.be.equal("bookmark");
      expect(taggingRecord.tagger).to.be.equal(accounts.RandomOne.address);
      expect(taggingRecord.publisher).to.be.equal(contracts.ETSTargetTagger.address);
      for (i = 0; i < taggingRecord.tagIds; i++) {
        const tag = contracts.ETSToken.getTag(taggingRecord.tagIds[i].toString());
        expect(tagParams.tagStrings.includes(tag.display.toString())).to.be.equal(true);
      }
    });

    it("should be retrievable by it's unique composite key", async () => {
      const taggingRecord = await contracts.ETS.getTaggingRecord(
        targetId,
        "bookmark",
        contracts.ETSTargetTagger.address,
        accounts.RandomOne.address,
      );

      expect(taggingRecord.targetId.toString()).to.be.equal(targetId);
    });

    it("should be retrievable by tagging record id", async () => {
      const taggingRecord = await contracts.ETS.getTaggingRecordFromId(taggingRecordId);
      expect(taggingRecord.targetId.toString()).to.be.equal(targetId);
    });

    it("will reuse existing tags and targets", async function () {
      const existingTargetId = targetId;
      const tag1Id = await contracts.ETSToken.computeTagId("#dex");
      const tag2Id = await contracts.ETSToken.computeTagId("#ethereum");
      const reusedTagIds = [tag1Id, tag2Id];

      // Create new tagging record with same inputs except with different tagger.
      // this will yield a new tagging record.
      const taggingRecordInputParams = {
        targetURI: targetURI, // "https://google.com"
        tagStrings: ["#dex", "#ethereum"],
        recordType: "bookmark",
        enrich: false,
      };
      const taggingRecordsInput = [taggingRecordInputParams];
      // RandomTwo is tagger, ETSTargetTagger is publisher.
      await contracts.ETSTargetTagger.connect(accounts.RandomTwo).tagTarget(taggingRecordsInput, {
        value: ethers.BigNumber.from(taggingFee).mul("2"),
      });

      // Get tagging record id from composite key.
      const newTaggingRecordId = await contracts.ETS.computeTaggingRecordId(
        existingTargetId,
        "bookmark",
        contracts.ETSTargetTagger.address,
        accounts.RandomTwo.address,
      );
      expect(newTaggingRecordId).to.not.be.equal(taggingRecordId);
      const newTaggingRecord = await contracts.ETS.getTaggingRecordFromId(newTaggingRecordId);
      expect(newTaggingRecord.targetId.toString()).to.be.equal(existingTargetId);
      expect(newTaggingRecord.recordType).to.be.equal("bookmark");
      expect(newTaggingRecord.tagger).to.be.equal(accounts.RandomTwo.address);
      expect(newTaggingRecord.publisher).to.be.equal(contracts.ETSTargetTagger.address);
      for (i = 0; i < newTaggingRecord.tagIds; i++) {
        expect(reusedTagIds.includes(newTaggingRecord.tagIds[i])).to.be.equal(true);
      }
    });
  });

  describe("Tagging fees should accrue", async () => {
    beforeEach("create a tagging record", async () => {
      platformPreTagAccrued = await contracts.ETS.accrued(accounts.ETSPlatform.address);
      publisherPreTagAccrued = await contracts.ETS.accrued(accounts.RandomOne.address);
      creatorPreTagAccrued = await contracts.ETS.accrued(accounts.Creator.address);
      ownerPreTagAccrued = await contracts.ETS.accrued(accounts.RandomTwo.address);
    });

    it("to the token creator when the tag used is platform owned (pre-auction)", async () => {
      // In this test, we are creating a tagging record using a platform owned tag (#Love). #Love already
      // exists as a Platform owned token (hasn't been auctioned yet; see the "test setup" step at the beginning
      // of this test suite.) Tagging fees are distributed to Platform (accounts.ETSPlatform), Token Publisher
      // (accounts.RandomOne) and Creator (accounts.Creator).
      const taggingRecordInputParams = {
        targetURI: "https://uniswap.org",
        tagStrings: ["#Love"],
        recordType: "bookmark",
        enrich: false,
      };
      const taggingRecordsInput = [taggingRecordInputParams];

      // RandomTwo is tagger, ETSTargetTagger is publisher.
      await contracts.ETSTargetTagger.connect(accounts.RandomTwo).tagTarget(taggingRecordsInput, {
        value: ethers.BigNumber.from(taggingFee),
      });
      // Check that tagging fee for one tag is divided up and distributed correctly.
      // Platform accrued.
      platformPostTagAccrued = await contracts.ETS.accrued(accounts.ETSPlatform.address);
      publisherPostTagAccrued = await contracts.ETS.accrued(accounts.RandomOne.address);
      creatorPostTagAccrued = await contracts.ETS.accrued(accounts.Creator.address);

      const platformPercentage = (await contracts.ETS.platformPercentage()) / 100;
      const publisherPercentage = (await contracts.ETS.publisherPercentage()) / 100;

      expect(platformPostTagAccrued).to.equal(platformPreTagAccrued + taggingFee * platformPercentage);

      // Publisher accrued.
      expect(publisherPostTagAccrued).to.equal(publisherPreTagAccrued + taggingFee * publisherPercentage);

      // Token creator
      expect(creatorPostTagAccrued).to.equal(
        creatorPreTagAccrued + taggingFee * (1 - (platformPercentage + publisherPercentage)),
      );
    });

    it("to the token owner when the tag used is user owned (post-auction)", async () => {
      // In this test, is the same as the previous test, except this time we are using an "owned" token.
      const taggingRecordInputParams = {
        targetURI: "https://uniswap.org",
        tagStrings: ["#Incredible"],
        recordType: "bookmark",
        enrich: false,
      };
      const taggingRecordsInput = [taggingRecordInputParams];

      // RandomTwo is tagger, ETSTargetTagger is publisher.
      await contracts.ETSTargetTagger.connect(accounts.RandomTwo).tagTarget(taggingRecordsInput, {
        value: ethers.BigNumber.from(taggingFee),
      });
      // Check that tagging fee for one tag is divided up and distributed correctly.
      // Platform accrued.
      platformPostTagAccrued = await contracts.ETS.accrued(accounts.ETSPlatform.address);
      publisherPostTagAccrued = await contracts.ETS.accrued(accounts.RandomOne.address);
      ownerPostTagAccrued = await contracts.ETS.accrued(accounts.RandomTwo.address);

      const platformPercentage = (await contracts.ETS.platformPercentage()) / 100;
      const publisherPercentage = (await contracts.ETS.publisherPercentage()) / 100;

      expect(platformPostTagAccrued).to.equal(platformPreTagAccrued + taggingFee * platformPercentage);

      // Publisher accrued.
      expect(publisherPostTagAccrued).to.equal(publisherPreTagAccrued + taggingFee * publisherPercentage);

      // Token creator
      expect(ownerPostTagAccrued).to.equal(
        ownerPreTagAccrued + taggingFee * (1 - (platformPercentage + publisherPercentage)),
      );
    });
  });

  describe("Drawing down", async function () {
    beforeEach(async function () {
      const taggingRecordInputParams = {
        targetURI: "https://uniswap.org",
        tagStrings: ["#Love"],
        recordType: "bookmark",
        enrich: false,
      };
      const taggingRecordsInput = [taggingRecordInputParams];

      // RandomTwo is tagger, ETSTargetTagger is publisher.
      await contracts.ETSTargetTagger.connect(accounts.RandomTwo).tagTarget(taggingRecordsInput, {
        value: ethers.BigNumber.from(taggingFee),
      });
      // Check that tagging fee for one tag is divided up and distributed correctly.
      // Platform accrued.
      platformPostTagAccrued = await contracts.ETS.accrued(accounts.ETSPlatform.address);
      publisherPostTagAccrued = await contracts.ETS.accrued(accounts.RandomOne.address);
      creatorPostTagAccrued = await contracts.ETS.accrued(accounts.Creator.address);
    });

    it("can be performed on behalf of the platform", async function () {
      // Account A can draw down accumulated funds of
      // Account B to wallet of Account B.

      const platformBalanceBefore = await accounts.ETSPlatform.getBalance();

      // accountRandomOne is triggering the drawdown of ETH accrued in
      // accounts.ETSPlatform.
      await contracts.ETS.connect(accounts.RandomOne).drawDown(accounts.ETSPlatform.address);
      const platformBalanceAfter = await accounts.ETSPlatform.getBalance();

      // In this case we are expecting the value drawn down to be the
      // platform percentage cut of one tagging event.
      expect(platformBalanceAfter.sub(platformBalanceBefore)).to.be.equal(platformPostTagAccrued);
      expect((await contracts.ETS.paid(accounts.ETSPlatform.address)) == platformBalanceAfter);
    });

    it("does nothing after a double draw down", async function () {
      const platformBalanceBefore = await accounts.ETSPlatform.getBalance();
      await contracts.ETS.connect(accounts.RandomOne).drawDown(accounts.ETSPlatform.address);
      const platformBalanceAfter = await accounts.ETSPlatform.getBalance();

      expect(platformBalanceAfter.sub(platformBalanceBefore)).to.be.equal(platformPostTagAccrued);

      const balanceBeforeSecondDraw = await accounts.ETSPlatform.getBalance();
      await contracts.ETS.connect(accounts.RandomOne).drawDown(accounts.ETSPlatform.address);
      const balanceAfterSecondDraw = await accounts.ETSPlatform.getBalance();

      expect(balanceAfterSecondDraw.sub(balanceBeforeSecondDraw)).to.be.equal("0");
    });
  });
});

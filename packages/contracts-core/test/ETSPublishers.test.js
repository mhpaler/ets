const { setup } = require("./setup.js");
const { ethers, upgrades } = require("hardhat");
const { expect, assert } = require("chai");
const { BigNumber, constants } = ethers;

 describe("ETSToken grant/revoke publisher role tests", function () {
   // we create a setup function that can be called by every test and setup variable for easy to read tests
   beforeEach("Setup test", async function () {
    [accounts, contracts, initSettings] = await setup();

    // Set publisher threshold to 2
    await expect(await contracts.ETSAccessControls.connect(accounts.ETSPlatform)
    .setPublisherDefaultThreshold(2))
      .to.emit(contracts.ETSAccessControls, "PublisherDefaultThresholdSet")
      .withArgs(2);

    // Mint a couple tags
    tag1 = "#Love";
    await contracts.ETSToken.connect(accounts.RandomTwo).createTag(tag1, accounts.ETSPlatform.address);
    tag1Id = await contracts.ETSToken.computeTagId(tag1);
    tag1Id = tag1Id.toString();

    // Mint a tag and transfer away from platform.
    tag2 = "#Incredible";
    await contracts.ETSToken.connect(accounts.RandomTwo).createTag(tag2, accounts.ETSPlatform.address);
    tag2Id = await contracts.ETSToken.computeTagId(tag2);
    tag2Id = tag2Id.toString();
 
    });

    describe("Granting publisher role", async function () {
      it("reverts if ETSToken does not have PUBLISHER_ADMIN role", async () => {
        // Set publisherDefaultThreshold to 1 tag.
        await contracts.ETSAccessControls.connect(accounts.ETSPlatform)
          .setPublisherDefaultThreshold(1);

        // Note: ETSToken is granted PUBLISHER_ADMIN by default in setup.js
        // so revoking will make transfer revert. 
        await contracts.ETSAccessControls
          .connect(accounts.ETSPlatform)
          .revokeRole(
            ethers.utils.id("PUBLISHER_ADMIN"),
            contracts.ETSToken.address
          );

        const tx = contracts.ETSToken.connect(accounts.ETSPlatform)
          .transferFrom(
            accounts.ETSPlatform.address,
            accounts.RandomTwo.address,
            tag1Id
          );
        await expect(tx).to.be.reverted;
      });
      
      it("Succeeds if ETSToken has PUBLISHER_ADMIN role", async () => {
        // Note: ETSToken is granted PUBLISHER_ADMIN by default in setup.js 
        await contracts.ETSAccessControls.connect(accounts.ETSPlatform)
          .setPublisherDefaultThreshold(1);

        const tx = contracts.ETSToken
          .connect(accounts.ETSPlatform)
          .transferFrom(
            accounts.ETSPlatform.address,
            accounts.RandomTwo.address,
            tag1Id
          );
        await expect(tx)
          .to.emit(contracts.ETSAccessControls, 'RoleGranted')
          .withArgs(
            ethers.utils.id("PUBLISHER"),
            accounts.RandomTwo.address,
            contracts.ETSToken.address
          );
      });
    });
   
    describe("With publisherDefaultThreshold set to 2", async function () {
      describe("Purchasing one tag", async () => {
        beforeEach("Setup test", async function () {
          // transfer token to owner to simulate a purchase.
          await contracts.ETSToken
            .connect(accounts.ETSPlatform)
            .transferFrom(
              accounts.ETSPlatform.address,
              accounts.RandomTwo.address,
              tag1Id
            );
        });
        it("should not grant new owner publisher role", async function () {
          expect(
            await contracts.ETSAccessControls.isPublisher(accounts.RandomTwo.address)
          ).to.be.equal(false);
        });
      });
 
      describe("Purchasing two tags", async () => {
        beforeEach("Setup test", async function () {
          // transfer token to owner to simulate a purchase.
          await contracts.ETSToken
            .connect(accounts.ETSPlatform)
            .transferFrom(
              accounts.ETSPlatform.address,
              accounts.RandomTwo.address,
              tag1Id
            );
 
          await contracts.ETSToken
            .connect(accounts.ETSPlatform)
              .transferFrom(
                accounts.ETSPlatform.address,
                accounts.RandomTwo.address,
                tag2Id
              );
        });
        
        it("should grant owner publisher role", async function () {
          expect(
            await contracts.ETSAccessControls.isPublisher(accounts.RandomTwo.address)
          ).to.be.equal(true);
        });
      });

      describe("Purchasing two tags and selling one", async () => {
        beforeEach("Setup test", async function () {
          // transfer token to owner to simulate a purchase.
          await contracts.ETSToken
            .connect(accounts.ETSPlatform)
              .transferFrom(
                accounts.ETSPlatform.address,
                accounts.RandomTwo.address,
                tag1Id
              );

          await contracts.ETSToken
            .connect(accounts.ETSPlatform)
              .transferFrom(
                accounts.ETSPlatform.address,
                accounts.RandomTwo.address,
                tag2Id
              );
        });

        it("should revoke publisher role", async function () {

          let publisher_role = await contracts.ETSAccessControls.isPublisher(accounts.RandomTwo.address);
          expect(publisher_role).to.be.equal(true);
          
          await contracts.ETSToken.connect(accounts.RandomTwo)
            .transferFrom(
              accounts.RandomTwo.address,
              accounts.RandomOne.address,
              tag2Id
            );
          
          publisher_role = await contracts.ETSAccessControls.isPublisher(accounts.RandomTwo.address);
          expect(publisher_role).to.be.equal(false);
        });
      });
    });


    describe("With publisherDefaultThreshold set to 1", async function () {
      describe("Receiving tag from address other than platform", async () => {
        beforeEach("Setup test", async function () {
                  // Set publisherDefaultThreshold to 1 tag.
          await contracts.ETSAccessControls.connect(accounts.ETSPlatform)
          .setPublisherDefaultThreshold(1);
          // transfer token to owner to simulate a purchase.
          await contracts.ETSToken.connect(accounts.ETSPlatform)
            .transferFrom(
              accounts.ETSPlatform.address,
              accounts.RandomTwo.address,
              tag1Id
            );
        });

        it("does not grant publisher role to recipient", async function () {
          expect(
            await contracts.ETSAccessControls.isPublisher(accounts.RandomTwo.address)
          ).to.be.equal(true);
          
          await contracts.ETSToken
            .connect(accounts.RandomTwo)
              .transferFrom(
                accounts.RandomTwo.address,
                accounts.RandomOne.address,
                tag1Id
              );

          // Sender looses publisher role. But recipient doesn't gain role.
          expect(
            await contracts.ETSAccessControls.isPublisher(accounts.RandomTwo.address)
          ).to.be.equal(false);

          expect(
            await contracts.ETSAccessControls.isPublisher(accounts.RandomOne.address)
          ).to.be.equal(false);
        });
      });
    });
 });

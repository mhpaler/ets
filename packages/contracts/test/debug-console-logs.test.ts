import { expect } from "chai";
import { ethers } from "hardhat";
import type { Accounts, Contracts } from "./setup";
import { setup } from "./setup";

describe("Debug Console Logs", () => {
  let accounts: Accounts;
  let contracts: Contracts;

  beforeEach("Setup test", async () => {
    const result = await setup();
    ({ accounts, contracts } = result);
  });

  it("should show console logs for computeCoinAddress", async () => {
    const tag = "#DebugConsoleTest";
    
    console.log("=== TESTING computeCoinAddress ===");
    const computedAddress = await contracts.ETSToken.computeCoinAddress(tag);
    console.log("Test result - computed address:", computedAddress);
  });

  it("should show console logs for createTag flow", async () => {
    const tag = "#CreateTagConsoleTest";
    const creator = accounts.RandomTwo.address;
    
    console.log("=== TESTING createTag flow ===");
    await contracts.ETS.connect(accounts.ETSPlatform).createTag(tag, creator);
    console.log("Test result - TAG created successfully");
  });

  it("should compare addresses from both paths", async () => {
    const tag = "#ComparisonTest";
    const creator = accounts.RandomTwo.address;
    
    console.log("=== COMPARISON TEST ===");
    
    // First get computed address
    console.log("Step 1: Computing address...");
    const computedAddress = await contracts.ETSToken.computeCoinAddress(tag);
    console.log("Computed address:", computedAddress);
    
    // Then create TAG and see what address is actually used
    console.log("Step 2: Creating TAG...");
    await contracts.ETS.connect(accounts.ETSPlatform).createTag(tag, creator);
    
    // Get the TAG data to see the actual address
    const tagData = await contracts.ETSToken.getTagByString(tag);
    console.log("Actual address from TAG data:", tagData.coinAddress);
    
    console.log("Addresses match:", computedAddress === tagData.coinAddress);
    
    expect(computedAddress).to.equal(tagData.coinAddress);
  });
});
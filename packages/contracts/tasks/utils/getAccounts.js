const {ethers} = require("hardhat");

async function getAccounts() {
  const accounts = await ethers.getSigners();
  const namedAccounts = {
    account0: accounts[0],
    account1: accounts[1],
    account2: accounts[2],
    account3: accounts[3],
    account4: accounts[4],
    account5: accounts[5],
  };
  return namedAccounts;
}

module.exports = {
  getAccounts,
};

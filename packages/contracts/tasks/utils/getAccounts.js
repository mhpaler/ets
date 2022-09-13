const {ethers} = require("hardhat");

async function getAccounts() {
  const accounts = await ethers.getSigners();
  const namedAccounts = {
    Zero: accounts[0],
    One: accounts[1],
    Two: accounts[2],
    Three: accounts[3],
    Four: accounts[4],
    Five: accounts[5],
  };
  return namedAccounts;
}

module.exports = {
  getAccounts,
};

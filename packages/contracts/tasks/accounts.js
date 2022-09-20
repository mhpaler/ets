task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (let i = 0; i < 6; i++) {
    let balance = await accounts[i].getBalance();
    balance = ethers.utils.formatEther(balance);
    console.log(" ");
    console.log(`account${i}: ${accounts[i].address} Balance: ${balance}`);
  }
});

module.exports = {};

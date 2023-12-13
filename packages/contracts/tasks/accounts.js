task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  //console.log(accounts.provider);
  for (let i = 0; i < 6; i++) {
    let balance = await accounts[i].provider.getBalance(accounts[i].address);
    balance = ethers.formatEther(balance);
    console.log(" ");
    console.log(`account${i}: ${accounts[i].address} Balance: ${balance}`);
  }
});

module.exports = {};

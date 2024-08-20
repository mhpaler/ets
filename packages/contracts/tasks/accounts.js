task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  //console.info(accounts.provider);
  for (let i = 0; i <= 10; i++) {
    let balance = await accounts[i].provider.getBalance(accounts[i].address);
    balance = ethers.formatEther(balance);
    console.info(" ");
    console.info(`account${i}: ${accounts[i].address} Balance: ${balance}`);
  }
});

module.exports = {};

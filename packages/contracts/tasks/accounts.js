task("accounts", "Prints the list of accounts", async () => {

  let mnemonic = process.env.MNEMONIC;
  const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);

//  const firstAccount = hdNode.derivePath(`m/44'/60'/0'/0/0`); 
//  const secondAccount = hdNode.derivePath(`m/44'/60'/0'/0/1`);
//  const thirdAccount = hdNode.derivePath(`m/44'/60'/0'/0/2`);
//
//  console.log("firstAccount",firstAccount);
//  console.log("secondAccount",secondAccount);

  const accounts = await ethers.getSigners()

  //let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
  //console.log(mnemonicWallet.privateKey);

  for (const account of accounts) {
    
    console.log("account:", account)
  }
})

module.exports = {}

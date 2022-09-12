task("signers", "Prints an account's balance").setAction(async () => {

  let mnemonic = process.env.MNEMONIC;
  const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);

  const Admin = hdNode.derivePath(`m/44'/60'/0'/0/0`); 
  const Publisher = hdNode.derivePath(`m/44'/60'/0'/0/1`);
  const Platform = hdNode.derivePath(`m/44'/60'/0'/0/2`);
  const Tagger = hdNode.derivePath(`m/44'/60'/0'/0/3`);

  console.log("Admin",Admin);

})

module.exports = {}

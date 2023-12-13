// additionalTasks.js
const { run } = require("hardhat");

async function runLocalSetup() {
  const accounts = ["account3", "account4", "account5"];
  const recordsCount = 10;
  const tagsPerRecord = 3;

  // enable the auction
  await run("auctionhouse", {
    action: "togglepause",
    network: "localhost"
  });

  for (let i = 1; i <= recordsCount; i++) {
    const tags = Array.from({ length: tagsPerRecord }, (_, index) => `#tag${i * tagsPerRecord + index}`);

    await run("applyTags", {
      relayer: "ETSRelayer",
      signer: accounts[i % accounts.length], // Rotate through the available accounts
      tags: tags.join(","),
      uri: `https://example.com/${i}`,
      recordType: "bookmark",
      network: "localhost",
    });
  }
}

module.exports = runLocalSetup;

const axios = require('axios');
const randomWords = require('random-words');

task("testdata", "Create ETS test data on the targeted chain")
  .addOptionalParam("action", "Options include: createTag, createTaggingRecord", "", types.string)
  .addOptionalParam("qty", "Specify quantity to be created", "1", types.integer)
  .setAction(async (taskArgs, hre) => {
    if (taskArgs.action == "createTag") {
      await hre.run("testdata:createTag", { qty: taskArgs.qty });
    }

    if (taskArgs.action == "createTaggingRecords") {
      await hre.run("testdata:createTaggingRecords", { qty: taskArgs.qty });
    }

    if (taskArgs.action == "createAuctions") {
      await hre.run("testdata:createAuctions", { qty: taskArgs.qty });
    }

  });

subtask("testdata:createTag", "Creates a random CTAG from a random account.")
  .addParam("qty", "Number of CTAGs to mint")
  .setAction(async (taskArgs) => {
    const qty = taskArgs.qty;
    const namedAccounts = await getNamedAccounts();//["account3", "account4", "account5", "account6", "account7", "account8"];

    for (let i = 1; i <= qty; i++) {
      //const tags = Array.from({ length: tagsPerRecord }, (_, index) => `#tag${i * tagsPerRecord + index}`);
      await run("createTags", {
        relayer: "ETSRelayer",
        signer: namedAccounts[i % namedAccounts.length], // Rotate through the available namedAccounts
        tags: "#" + randomWords(),
        network: hre.network.name,
      });
    }
  });

subtask("testdata:createTaggingRecords", "Creates random tagging records")
  .addParam("qty", "Number of CTAGs to mint")
  .setAction(async (taskArgs) => {
    const qty = taskArgs.qty;
    const namedAccounts = await getNamedAccounts();

    for (let i = 1; i <= qty; i++) {

      // Generate an array of 1-4 random words
      const tagsCount = Math.floor(Math.random() * 4) + 1; // Random number between 1 and 4
      const randomWordsArray = Array.from({ length: tagsCount }, () => randomWords());

      // Create tags with "#" prefix for tagging
      const tags = randomWordsArray.map(word => `#${word}`).join(',');

      // Create a search query without "#" prefix
      const query = randomWordsArray.join(' ');

      let imageUrl = await searchUnsplashImage(query);
      if (imageUrl) {
        console.log("Search query: ", query);
        console.log(`Image URL: ${imageUrl}`);
      } else {
        console.log("Fetch random image");
        imageUrl = getRandomImage();
        continue; // Skip this iteration if no image was found
      }

      await run("applyTags", {
        relayer: "ETSRelayer",
        signer: namedAccounts[i % namedAccounts.length], // Rotate through the available namedAccounts
        tags: tags,
        uri: imageUrl,
        recordType: "bookmark",
        network: hre.network.name,
      });

      // Delay for 2 sec.
      await waitForProcessing(2);
    }
  });


subtask("testdata:createAuctions", "Creates, bids on and settles auctions. Assumes existence of tags.")
  .addParam("qty", "Number of auctions")
  .setAction(async (taskArgs) => {
    const qty = taskArgs.qty;
    const namedAccounts = await getNamedAccounts();

    let previousAuctionId;

    // Retrieve overall auction settings
    const auctionSettings = await hre.run("auctionhouse:settings", {
      output: "return",
      network: hre.network.name
    });

    if (auctionSettings.paused) {
      await hre.run("auctionhouse:togglepause", {
        network: hre.network.name
      });
    }

    if (auctionSettings.totalAuctions == 0) {
      // kick off the first auction.
      previousAuctionId = 0;
      console.log("Launching first action");
      console.log("Note: task will error out if no tags exist.");
      await hre.run("auctionhouse:nextauction", {
        network: hre.network.name
      });
    } else {
      const initialAuctionDetails = await hre.run("auctionhouse:showcurrent", {
        output: "return",
        network: hre.network.name
      });
      previousAuctionId = (initialAuctionDetails.auctionId - 1);
      console.log("previousAuctionId: ", previousAuctionId);
    }

    for (let i = 1; i <= qty; i++) {

      // Get the current Auction Details.
      const auctionDetails = await hre.run("auctionhouse:showcurrent", {
        output: "return",
        network: hre.network.name
      })// Get the current auction details.

      // Check if a new auction has started
      if (auctionDetails.auctionId != previousAuctionId) {

        console.log("-------------------------------------");
        console.log(`Creating test auction ${i} of ${qty}`);
        console.log("-------------------------------------");
        console.log("Auction Details:")
        console.log(auctionDetails);
        console.log("=====================================");

        previousAuctionId = auctionDetails.auctionId;

        if (!auctionDetails.ended) {
          // cast bids on the current auction.
          // Ensure first bid meets or exceeds reserve price
          let lastBid = BigInt(ethers.parseUnits(auctionDetails.currentHighBid, "ether"));
          const reservePrice = BigInt(ethers.parseUnits(auctionDetails.reservePrice, "ether"));
          if (lastBid < reservePrice) {
            lastBid = reservePrice;
          }
          // Cast 1 to 10 bids on from a randomly chose account.
          // Generate random number of bids between 1 and 10
          const numberOfBids = Math.floor(Math.random() * 10) + 1;

          for (let bidCount = 0; bidCount < numberOfBids; bidCount++) {
            const bidIncrement = lastBid * BigInt(auctionSettings.bidIncrement) / BigInt(100); // Assuming bidIncrement is 5%
            const nextBid = lastBid + bidIncrement;

            // Select a random signer
            const randomIndex = Math.floor(Math.random() * namedAccounts.length);
            const signer = namedAccounts[randomIndex];

            // Place bid
            await hre.run("auctionhouse:createbid", {
              id: auctionDetails.auctionId.toString(),
              bid: ethers.formatEther(nextBid.toString()), // Convert BigInt to string and format as Ether
              signer: signer,
              network: hre.network.name
            });

            // Wait for one second after each bid
            await waitForProcessing(2);
            lastBid = nextBid;
          }
        }

        if (!auctionDetails.settled) {
          await hre.run("auctionhouse:settleauction", {
            network: hre.network.name
          });

          await waitForProcessing(7);
        }

      } else {
        console.log("Waiting for new auction to start...");
        await waitForProcessing(5); // Shorter pause before checking again
      }
    }
  });


async function waitForProcessing(waitTime = 5) {
  process.stdout.write("Waiting for process to complete");
  for (let i = 0; i < waitTime; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // wait for 1 second
    process.stdout.write(".");
  }
  console.log("\nDone waiting.");
}

async function getNamedAccounts() {
  return ["account3", "account4", "account5", "account6", "account7", "account8", "account9", "account10"];
}

async function getRandomImage() {
  const accessKey = '9mD4DxGuJvw7IWqJQhIxe0FKAZsIA63Pt4_xgVCau_Y'; // Replace with your Unsplash Access Key
  const url = `https://api.unsplash.com/photos/random?client_id=${accessKey}`;

  try {
    const response = await axios.get(url);
    return response.data.urls.regular; // Get the regular-sized image URL
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}

async function searchUnsplashImage(query) {
  const accessKey = '9mD4DxGuJvw7IWqJQhIxe0FKAZsIA63Pt4_xgVCau_Y'; // Replace with your Unsplash Access Key
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${accessKey}`;

  try {
    const response = await axios.get(url);
    const photos = response.data.results;

    if (photos.length > 0) {
      // Return the URL of the first image in the search results
      return photos[0].urls.regular;
    } else {
      console.log('No images found for query:', query);
      return null;
    }
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    return null;
  }
}

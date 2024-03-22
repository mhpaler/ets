import { initializeSigner } from "./../services/initializeSigner";
import { BlockchainService } from "./../services/blockchainService";

function main() {
  // Check if the NETWORK environment variable is set to "localhost"
  if (process.env.NETWORK !== "localhost") {
    console.error(
      `To start the testing oracle on localhost, set the NETWORK environment variable in the project root to "localhost"'`,
    );
    return; // Exit early if the condition is not met
  }

  initializeSigner()
    .then((signer) => {
      const blockchainService = new BlockchainService(signer);
      blockchainService.watchRequestCreateAuction();
    })
    .catch((error) => {
      console.error("Failed to initialize the oracle listener:", error);
    });
}

main();

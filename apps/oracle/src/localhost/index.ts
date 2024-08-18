import { BlockchainService } from "./../services/blockchainService";
import { initializeSigner } from "./../services/initializeSigner";

/**
 * The main function to initialize and start the local oracle for testing.
 * It ensures the environment is correctly set for local testing and initializes
 * the blockchain service to watch and handle auction-related events.
 */
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

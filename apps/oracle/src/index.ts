/**
 * This is the entry point of the application.
 * It initializes the blockchain service and starts watching for the "RequestCreateAuction" event.
 */

// Import the blockchain service instance.
import blockchainService from "./services/blockchainService.ts";

// Start watching for the "RequestCreateAuction" event.
blockchainService.watchRequestCreateAuction();

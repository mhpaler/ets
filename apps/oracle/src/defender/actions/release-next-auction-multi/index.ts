import type { ActionEvent, BlockTriggerEvent } from "@openzeppelin/defender-sdk-action-client";
import { BlockchainService } from "./../../../services/blockchainService";
import { initializeSigner } from "./../../../services/initializeSigner";

// Known event signatures for debugging
const EVENT_SIGNATURES = {
  "0x96852275d2408028e5465d831c70b45436794e221b81ff364822d4b56a568457": "RequestCreateAuction",
  "0x16e2e3ae9f2743d8576c746a1919a5317347ed51021f4cddaf26b4f8806f4194": "AuctionCreated",
  // Add more signatures as you discover them
};

// Correct RequestCreateAuction event signature hash
const REQUEST_CREATE_AUCTION_SIGNATURE = "0x96852275d2408028e5465d831c70b45436794e221b81ff364822d4b56a568457";

// Type guard to check if the event is a BlockTriggerEvent
function isBlockTriggerEvent(body: any): body is BlockTriggerEvent {
  return body && body.type === "BLOCK" && !!body.transaction;
}

// Main handler function to be invoked by Defender or locally for testing.
export async function handler(event: ActionEvent): Promise<void> {
  try {
    // Log the entire event request for debugging (optional, can be removed in production)
    console.info("****** EVENT REQUEST DETAILS ******");
    console.info(JSON.stringify(event.request, null, 2));

    // Check if event body is a BlockTriggerEvent
    if (!event.request?.body || !isBlockTriggerEvent(event.request.body)) {
      console.info("Not a block trigger event. Skipping processing.");
      return;
    }

    // Now TypeScript knows this is a BlockTriggerEvent with transaction and logs
    const blockEvent = event.request.body;
    const logs = blockEvent.transaction.logs;

    if (!logs || logs.length === 0) {
      console.info("No logs found in the event. Skipping processing.");
      return;
    }

    // Debug info: Print all event signatures in this transaction
    console.info("****** EVENT SIGNATURES IN TRANSACTION ******");
    logs.forEach((log, index) => {
      if (log.topics && log.topics.length > 0) {
        const signature = log.topics[0];
        const eventName = EVENT_SIGNATURES[signature as keyof typeof EVENT_SIGNATURES] || "Unknown Event";
        console.info(`Log #${index}: Signature: ${signature} | Event Name: ${eventName}`);
      }
    });

    // Check if any of the logs is a RequestCreateAuction event
    const isRequestCreateAuctionEvent = logs.some(
      (log) => log.topics && log.topics.length > 0 && log.topics[0] === REQUEST_CREATE_AUCTION_SIGNATURE,
    );

    if (!isRequestCreateAuctionEvent) {
      console.info("RequestCreateAuction event not found. Skipping auction processing.");
      return;
    }

    // If we reach here, it's a RequestCreateAuction event, so process it
    console.info("RequestCreateAuction event detected. Processing...");

    const { signer, chainId } = await initializeSigner(event);
    console.info("****** MONITOR CHAIN ID ******");
    console.info(`Monitor executed on Chain ID: ${chainId}`);

    const blockchainService = new BlockchainService(signer, chainId);
    await blockchainService.handleRequestCreateAuctionEvent();
  } catch (error) {
    console.error("Error in handler:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

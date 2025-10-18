import { log } from "@graphprotocol/graph-ts";
import { getTagByCoinAddress } from "../entities/Tag";
import { CoinCreatedV4 } from "../generated/ZoraFactory/MockZoraFactory";

/**
 * Handler for Zora CoinCreatedV4 events
 * Updates TAG status from PENDING to MINTED when coin is deployed
 */
export function handleCoinCreatedV4(event: CoinCreatedV4): void {
  const coinAddress = event.params.coin;

  log.info("CoinCreatedV4 event received for coin: {}", [coinAddress.toHexString()]);

  // Look up the Tag by coin address
  const tag = getTagByCoinAddress(coinAddress);

  if (tag === null) {
    log.warning("CoinCreatedV4 event received but no tag found for coin address: {}", [coinAddress.toHexString()]);
    return;
  }

  // Update tag status to MINTED
  tag.status = "MINTED";
  tag.mintedAt = event.block.timestamp;
  tag.mintTxHash = event.transaction.hash.toHexString();
  tag.uri = event.params.uri;

  tag.save();

  log.info("TAG {} (coin: {}) status updated to MINTED at block {}", [
    tag.tagId.toString(),
    coinAddress.toHexString(),
    event.block.number.toString(),
  ]);
}

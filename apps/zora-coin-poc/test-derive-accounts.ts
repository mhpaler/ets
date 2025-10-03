#!/usr/bin/env bun
/**
 * Test HD wallet derivation to find correct index for ETSZora
 */

import { mnemonicToAccount } from "viem/accounts";

const mnemonic = "three toddler enjoy good finish there bracket home machine habit hat useful";
const expectedZoraAddress = "0x560342404d1Ee14A60DE067975a3ca14840A837f";

console.log("Testing HD wallet derivation for ETSZora");
console.log(`Expected address: ${expectedZoraAddress}\n`);

// Test with addressIndex (correct parameter)
console.log("Testing with addressIndex (not accountIndex):\n");
for (let i = 0; i < 10; i++) {
  const account = mnemonicToAccount(mnemonic, {
    addressIndex: i,
  });

  const match = account.address.toLowerCase() === expectedZoraAddress.toLowerCase();
  const label = match ? "✅ MATCH!" : "";

  console.log(`addressIndex ${i}: ${account.address} ${label}`);
}

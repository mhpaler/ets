#!/usr/bin/env node
/**
 * Basic test of compiled config package
 */

const { getEnvironment, logEnvironment } = require("./dist");

console.log("🧪 Testing @ethereum-tag-service/config package\n");

// Get current environment
const env = getEnvironment();
console.log(`✅ Environment: ${env.displayName}`);
console.log(`✅ Network: ${env.network.name} (Chain ${env.network.chainId})`);
console.log(`✅ RPC URL: ${env.network.rpcUrl}`);
console.log(`✅ Features:`);
console.log(`   - TAG Coins: ${env.features?.tagCoins ? "✅" : "❌"}`);
console.log(`   - Target Enrichment: ${env.features?.targetEnrichment ? "✅" : "❌"}`);
console.log(`   - Zora Integration: ${env.features?.zoraIntegration ? "✅" : "❌"}`);

console.log("\nFull environment details:");
logEnvironment(env);

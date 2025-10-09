#!/usr/bin/env tsx
/**
 * Test usage of @ethereum-tag-service/config package
 * Run with: tsx test-usage.ts
 */

import {
  ETSConfig,
  getEnvironment,
  getNetwork,
  getTestConfig,
  logEnvironment,
  validateEnvVars,
  validateEnvironment,
} from "./src";

async function testConfigPackage() {
  console.log("🧪 Testing @ethereum-tag-service/config package\n");

  // Test 1: Get current environment
  console.log("1️⃣  Getting current environment...");
  const env = getEnvironment();
  console.log(`   Environment: ${env.displayName}`);
  console.log(`   Chain: ${env.network.chainId}`);
  console.log(`   RPC: ${env.network.rpcUrl}\n`);

  // Test 2: Get network config directly
  console.log("2️⃣  Getting network configuration...");
  const network = getNetwork();
  console.log(`   Network: ${network.name}`);
  console.log(`   Chain ID: ${network.chainId}`);
  console.log(`   Block Explorer: ${network.blockExplorer || "N/A"}\n`);

  // Test 3: Get test configuration
  console.log("3️⃣  Getting test configuration...");
  const testConfig = getTestConfig();
  console.log(`   Read-only: ${testConfig.readOnly}`);
  console.log(`   Requires local stack: ${testConfig.requiresLocalStack}`);
  console.log(`   Transaction timeout: ${testConfig.timeouts.transaction}ms\n`);

  // Test 4: Log full environment
  console.log("4️⃣  Logging full environment:");
  logEnvironment();

  // Test 5: Validate environment
  console.log("5️⃣  Validating environment...");
  const validation = validateEnvironment(env);
  if (validation.valid) {
    console.log("   ✅ Environment configuration is valid");
  } else {
    console.log("   ❌ Environment validation failed:");
    for (const err of validation.errors) {
      console.log(`      - ${err}`);
    }
  }
  if (validation.warnings.length > 0) {
    console.log("   ⚠️  Warnings:");
    for (const warn of validation.warnings) {
      console.log(`      - ${warn}`);
    }
  }
  console.log("");

  // Test 6: Check feature flags
  console.log("6️⃣  Checking feature flags...");
  const config = ETSConfig.getInstance();
  console.log(`   TAG Coins: ${config.isFeatureEnabled("tagCoins") ? "✅" : "❌"}`);
  console.log(`   Target Enrichment: ${config.isFeatureEnabled("targetEnrichment") ? "✅" : "❌"}`);
  console.log(`   Zora Integration: ${config.isFeatureEnabled("zoraIntegration") ? "✅" : "❌"}\n`);

  // Test 7: Try to get contract addresses (may fail if contracts not deployed)
  console.log("7️⃣  Attempting to load contract addresses...");
  try {
    const contracts = await config.getContracts();
    if (Object.keys(contracts).length > 0) {
      console.log("   ✅ Contract addresses loaded:");
      for (const [name, address] of Object.entries(contracts)) {
        if (address) console.log(`      ${name}: ${address}`);
      }
    } else {
      console.log("   ⚠️  No contracts found for this environment");
    }
  } catch (error) {
    console.log(`   ⚠️  Could not load contracts: ${error}`);
  }
  console.log("");

  // Test 8: Environment detection
  console.log("8️⃣  Testing environment detection...");
  const envVars = [
    { name: "ENVIRONMENT", value: process.env.ENVIRONMENT },
    { name: "NODE_ENV", value: process.env.NODE_ENV },
    { name: "HARDHAT_NETWORK", value: process.env.HARDHAT_NETWORK },
    { name: "NETWORK", value: process.env.NETWORK },
  ];
  console.log("   Environment variables checked (in priority order):");
  for (const { name, value } of envVars) {
    console.log(`      ${name}: ${value || "(not set)"}`);
  }
  console.log(`   Detected environment: ${env.name}\n`);

  // Test 9: Validate required env vars
  console.log("9️⃣  Checking for required environment variables...");
  const requiredVars = ["ALCHEMY_API_KEY"];
  const envValidation = validateEnvVars(requiredVars);
  if (envValidation.valid) {
    console.log("   ✅ All required environment variables are set");
  } else {
    console.log("   ❌ Missing environment variables:");
    for (const err of envValidation.errors) {
      console.log(`      - ${err}`);
    }
  }
  if (envValidation.warnings.length > 0) {
    console.log("   ⚠️  Security warnings:");
    for (const warn of envValidation.warnings) {
      console.log(`      - ${warn}`);
    }
  }

  console.log("\n✅ Config package test complete!");
}

// Run the test
testConfigPackage().catch(console.error);

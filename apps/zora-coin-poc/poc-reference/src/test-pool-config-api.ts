/**
 * Test Zora Pool Config API independently
 *
 * This script tests the pool config API call directly to debug authentication
 * and parameter issues without running the full coin creation flow.
 */

// Configuration
const API_URL_SDK = "https://api-sdk.zora.engineering/create/content/pool-config";
const CHAIN_ID = process.env.CHAIN_ID || "8453"; // Base mainnet
const ZORA_API_KEY = process.env.ZORA_API_KEY;

interface PoolConfigTest {
  currency: string;
  startingMarketCap: string;
  chainId: string;
}

async function testPoolConfigAPI() {
  console.log("🔍 Testing Zora Pool Config API");
  console.log("📡 SDK URL:", API_URL_SDK);
  console.log("⛓️ Chain ID:", CHAIN_ID);
  console.log("🔑 Has API Key:", !!ZORA_API_KEY && ZORA_API_KEY !== "your_zora_api_key_here");
  console.log("=".repeat(60));

  const testCases: PoolConfigTest[] = [
    {
      currency: "CREATOR_COIN_OR_ZORA",
      startingMarketCap: "HIGH",
      chainId: CHAIN_ID,
    },
    {
      currency: "ZORA",
      startingMarketCap: "HIGH",
      chainId: CHAIN_ID,
    },
    {
      currency: "ETH",
      startingMarketCap: "HIGH",
      chainId: CHAIN_ID,
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.currency} + ${testCase.startingMarketCap}`);

    console.log("\n  📍 Testing with SDK URL");

    try {
      const params = new URLSearchParams({
        chain_id: testCase.chainId,
        currency: testCase.currency,
        starting_market_cap: testCase.startingMarketCap,
      });

      // Use SDK style auth (api-key header)
      const headers = {
        Accept: "application/json",
        "User-Agent": "ETS-Pool-Config-Test/1.0",
        ...(ZORA_API_KEY && ZORA_API_KEY !== "your_zora_api_key_here" ? { "api-key": ZORA_API_KEY } : {}),
      };

      const requestUrl = `${API_URL_SDK}?${params}`;
      console.log("📤 Request URL:", requestUrl);
      console.log("📋 Headers:", Object.keys(headers));

      const response = await fetch(requestUrl, {
        method: "GET",
        headers,
      });

      console.log("📨 Response Status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ ERROR Response:", errorText);
        continue;
      }

      const data = await response.json();
      console.log("✅ SUCCESS!");
      console.log("📦 Response Keys:", Object.keys(data));

      if (data.poolConfig) {
        console.log("🎯 Pool Config Length:", data.poolConfig.length);
        console.log("🔗 Pool Config Preview:", `${data.poolConfig.substring(0, 20)}...`);
      } else {
        console.log("⚠️ No poolConfig in response");
      }
    } catch (error) {
      console.error("    💥 Request Failed:", error);
    }
  }
}

// Run the test
testPoolConfigAPI().catch(console.error);

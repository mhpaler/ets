/**
 * Staging Oracle Test Script
 *
 * This script tests the deployed Oracle HTTP Gateway endpoints directly
 * by making requests to the AWS Lambda functions and verifying responses.
 */

import fs from "node:fs/promises";
import path from "node:path";
import * as dotenv from "dotenv";

// Load environment variables from .env.staging file
dotenv.config({ path: path.join(__dirname, "../.env.staging") });

interface DeploymentInfo {
  airnodeAddress: string;
  httpGatewayUrl: string;
  deploymentTimestamp: string;
  environment: string;
  deploymentId: string;
}

interface OracleTestResult {
  endpoint: string;
  success: boolean;
  response?: any;
  error?: string;
  responseTime?: number;
}

async function makeHttpGatewayRequest(
  gatewayUrl: string,
  endpointId: string,
  parameters: Record<string, any>,
): Promise<{ response: any; responseTime: number }> {
  const startTime = Date.now();

  const response = await fetch(`${gatewayUrl}/${endpointId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parameters }),
  });

  const responseTime = Date.now() - startTime;

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return { response: data, responseTime };
}

async function testNextAuctionEndpoint(gatewayUrl: string): Promise<OracleTestResult> {
  const endpointId = "0xf898508c530f6658d4c4ca0098911d4b32d7e990c23500efe4d4aa3764bd0b49";

  try {
    console.log("\n📞 Testing nextAuction endpoint...");

    const { response, responseTime } = await makeHttpGatewayRequest(gatewayUrl, endpointId, {
      chainId: "421614",
    });

    // Validate response structure
    if (!response.rawValue || typeof response.rawValue.success === "undefined") {
      throw new Error("Invalid response structure");
    }

    const { rawValue } = response;

    console.log(`✅ Success! Response time: ${responseTime}ms`);
    console.log(`- Success: ${rawValue.success}`);
    console.log(`- Has Eligible Tag: ${rawValue.hasEligibleTag}`);
    console.log(`- Tag Display: ${rawValue.tagDisplay || "N/A"}`);

    return {
      endpoint: "nextAuction",
      success: true,
      response: rawValue,
      responseTime,
    };
  } catch (error) {
    console.log(`❌ Failed: ${error instanceof Error ? error.message : String(error)}`);

    return {
      endpoint: "nextAuction",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function testEnrichTargetEndpoint(gatewayUrl: string): Promise<OracleTestResult> {
  const endpointId = "0x5d09ceade33f5e4e5627a6400eaf9ad5fbbecc6c16ce3802f784b480c06b867d";
  const testTargetId = "80371362703188808349777448140190310083809086108901048823185682177394706595976";

  try {
    console.log("\n📞 Testing enrichTarget endpoint...");
    console.log(`- Using target ID: ${testTargetId}`);

    const { response, responseTime } = await makeHttpGatewayRequest(gatewayUrl, endpointId, {
      chainId: "421614",
      targetId: testTargetId,
    });

    // Validate response structure
    if (!response.rawValue || typeof response.rawValue.success === "undefined") {
      throw new Error("Invalid response structure");
    }

    const { rawValue } = response;

    console.log(`✅ Success! Response time: ${responseTime}ms`);
    console.log(`- Success: ${rawValue.success}`);
    console.log(`- HTTP Status: ${rawValue.httpStatus}`);
    console.log(`- Arweave TX ID: ${rawValue.txId}`);

    if (rawValue.txId) {
      console.log(`- View on Arweave: https://arweave.net/${rawValue.txId}`);
    }

    return {
      endpoint: "enrichTarget",
      success: true,
      response: rawValue,
      responseTime,
    };
  } catch (error) {
    console.log(`❌ Failed: ${error instanceof Error ? error.message : String(error)}`);

    return {
      endpoint: "enrichTarget",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function testStagingOracle() {
  try {
    console.log("=== Testing Staging Oracle HTTP Gateway ===");

    // Load deployment info
    const configDir = path.join(__dirname, "../config/staging");
    const deploymentInfoPath = path.join(configDir, "deployment-info.json");

    let deploymentInfo: DeploymentInfo;
    try {
      const deploymentData = await fs.readFile(deploymentInfoPath, "utf8");
      deploymentInfo = JSON.parse(deploymentData);
    } catch (_error) {
      throw new Error("Could not load deployment-info.json. Has the Oracle been deployed?");
    }

    console.log("\n🔧 Oracle Configuration:");
    console.log(`- Airnode Address: ${deploymentInfo.airnodeAddress}`);
    console.log(`- HTTP Gateway URL: ${deploymentInfo.httpGatewayUrl}`);
    console.log(`- Deployment ID: ${deploymentInfo.deploymentId}`);
    console.log(`- Environment: ${deploymentInfo.environment}`);
    console.log(`- Deployed: ${new Date(deploymentInfo.deploymentTimestamp).toLocaleString()}`);

    // Test both endpoints
    const results: OracleTestResult[] = [];

    results.push(await testNextAuctionEndpoint(deploymentInfo.httpGatewayUrl));
    results.push(await testEnrichTargetEndpoint(deploymentInfo.httpGatewayUrl));

    // Summary
    console.log("\n📊 Test Results Summary:");
    console.log("=".repeat(50));

    const successCount = results.filter((r) => r.success).length;
    const totalTests = results.length;

    for (const result of results) {
      const status = result.success ? "✅ PASS" : "❌ FAIL";
      const timing = result.responseTime ? `(${result.responseTime}ms)` : "";
      console.log(`${status} ${result.endpoint} ${timing}`);

      if (!result.success && result.error) {
        console.log(`     Error: ${result.error}`);
      }
    }

    console.log("-".repeat(50));
    console.log(`${successCount}/${totalTests} tests passed`);

    if (successCount === totalTests) {
      console.log("\n🎉 All Oracle endpoints are working correctly!");
      return true;
    }
    console.log(`\n⚠️ ${totalTests - successCount} test(s) failed. Check the errors above.`);
    return false;
  } catch (error) {
    console.error("Error testing Oracle:", error);
    throw error;
  }
}

// Run the test when executed directly
if (require.main === module) {
  testStagingOracle()
    .then(() => {
      console.log("\nTest completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error(`\nTest failed: ${error.message}`);
      process.exit(1);
    });
}

export default testStagingOracle;

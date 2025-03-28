/**
 * Staging Oracle Deployment Script
 *
 * This script orchestrates the complete setup and deployment of the
 * ETS Oracle service to AWS for the staging environment.
 *
 * Workflow:
 * 1. Generate Airnode Credentials for staging
 * 2. Generate Staging Airnode configuration
 * 3. Setup sponsorship relationship
 * 4. Configure staging ETSEnrichTarget requester contract
 * 5. Deploy Airnode to AWS cloud
 *
 * Prerequisites:
 * - AWS credentials must be configured
 * - Staging contracts must be deployed to Arbitrum Sepolia
 * - Admin wallet with ETH for transactions must be available
 * - Staging API must be deployed and accessible
 */

import { generateStagingCredentials } from "./10-generate-staging-credentials";
import { generateStagingConfig } from "./20-generate-staging-config";
import { setupStagingSponsorship } from "./30-setup-staging-sponsorship";
import { configureStagingRequester } from "./40-configure-staging-requester";
import { deployStagingAirnode } from "./50-deploy-staging-airnode";

export async function deployStagingOracle() {
  try {
    console.log("=== ETS Staging Oracle Deployment ===");

    console.log("\nStep 1/5: Generating Airnode credentials for staging...");
    const credentials = await generateStagingCredentials();

    console.log("\nStep 2/5: Generating Staging Airnode configuration...");
    await generateStagingConfig();

    console.log("\nStep 3/5: Setting up sponsorship for staging environment...");
    const sponsorship = await setupStagingSponsorship();

    console.log("\nStep 4/5: Configuring staging requester contract...");
    const requesterConfig = await configureStagingRequester();

    console.log("\nStep 5/5: Deploying Airnode to AWS...");
    const deployment = await deployStagingAirnode();

    console.log("\n✅ Staging Oracle deployment completed successfully!");
    console.log("\nSummary:");
    console.log(`- Airnode Address: ${credentials.airnodeAddress}`);
    console.log(`- ETSEnrichTarget Contract: ${sponsorship.requesterAddress}`);
    console.log(`- Endpoint ID: ${sponsorship.endpointId}`);
    console.log(`- Sponsor Wallet: ${sponsorship.sponsorWalletAddress}`);

    console.log(
      "\nThe Airnode is now running on AWS and listening for requests from the Staging ETSEnrichTarget contract.",
    );
    console.log("You can verify the deployment by checking the AWS Lambda console and CloudWatch logs.");
    console.log(
      "To test the oracle, create a target in the staging environment and call requestEnrichTarget on the ETSEnrichTarget contract.",
    );

    return {
      success: true,
      credentials,
      sponsorship,
      requesterConfig,
      deployment,
    };
  } catch (error) {
    console.error("\n❌ Staging Oracle deployment failed:", error);
    throw error;
  }
}

// For command-line usage
if (require.main === module) {
  deployStagingOracle()
    .then(() => {
      console.log("\nStaging Oracle is now running and ready to process requests");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}

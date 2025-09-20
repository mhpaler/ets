import { network } from "hardhat";
import { encodeFunctionData, parseEther } from "viem";
import { getNetworkSettings } from "../../config/settings.js";
import ETSChannelFactoryModule from "../../ignition/modules/ETSChannelFactory.js";
import ETSEnrichTargetModule from "../../ignition/modules/ETSEnrichTarget.js";
import WETHModule from "../../ignition/modules/WETH.js";
import { type ETSAccounts, getETSAccounts } from "../../utils/accounts.js";

/**
 * Complete Ignition-based fixture that replaces test/setup.ts
 *
 * This fixture provides the complete ETS system deployment with:
 * - All contracts deployed via Ignition modules
 * - Full dependency resolution (UUPS + Beacon proxies)
 * - Post-deployment configuration (roles, linking, channels)
 * - Compatible interface with existing tests
 */

export interface IgnitionContracts {
  WETH: any;
  ETSAccessControls: any;
  ETSToken: any;
  ETSTarget: any;
  ETSEnrichTarget: any;
  ETS: any;
  ETSChannelFactory: any;
  ETSChannelImplementation: any;
  ETSChannel: any;
  secondChannel: any;
  MockZoraFactory: any;
}

export interface IgnitionAccounts extends ETSAccounts {}

export interface IgnitionSetupResult {
  accounts: IgnitionAccounts;
  contracts: IgnitionContracts;
  initSettings: ReturnType<typeof getNetworkSettings>;
}

/**
 * Deploy complete ETS system using Ignition modules
 */
export async function ignitionFixture(): Promise<IgnitionSetupResult> {
  const { ignition, viem } = await network.connect();

  // Get wallet clients for account setup
  const walletClients = await viem.getWalletClients();
  const accounts = getETSAccounts(walletClients);

  // Deploy WETH separately (optional dependency)
  const { weth } = (await ignition.deploy(WETHModule)) as any;

  // Deploy complete ETS system with ChannelFactory (includes everything)
  const { channelFactory, channelImplementation, etsCore, token, target, accessControls, mockZoraFactory } =
    (await ignition.deploy(ETSChannelFactoryModule, {
      parameters: {
        ETSAccessControls: {
          platformAddress: accounts.ETSPlatform.account.address,
        },
        ETSCore: {
          taggingFee: parseEther("0.1"),
          platformPercentage: 20,
          channelPercentage: 30,
        },
      },
    })) as any;

  // Deploy ETSEnrichTarget manually using the same contracts from ChannelFactory
  // We can't use the ETSEnrichTargetModule because it creates its own AccessControls and Target
  const enrichTargetImplementation = await viem.deployContract("ETSEnrichTarget", []);

  // Create initialization calldata using viem's encodeFunctionData
  const initializeCalldata = encodeFunctionData({
    abi: [
      {
        inputs: [
          { internalType: "contract IETSAccessControls", name: "_etsAccessControls", type: "address" },
          { internalType: "contract IETSTarget", name: "_etsTarget", type: "address" },
        ],
        name: "initialize",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    functionName: "initialize",
    args: [accessControls.address, target.address],
  });

  // Deploy proxy
  const enrichTargetProxy = await viem.deployContract("ERC1967Proxy", [
    enrichTargetImplementation.address,
    initializeCalldata,
  ]);

  const enrichTarget = { address: enrichTargetProxy.address };

  // Get contract instances for post-deployment setup
  const accessControlsContract = await viem.getContractAt("ETSAccessControls", accessControls.address);
  const targetContract = await viem.getContractAt("ETSTarget", target.address);
  const tokenContract = await viem.getContractAt("ETSToken", token.address);
  const etsCoreContract = await viem.getContractAt("ETS", etsCore.address);
  const channelFactoryContract = await viem.getContractAt("ETSChannelFactory", channelFactory.address);

  // ============ POST-DEPLOYMENT CONFIGURATION ============

  // Set role admins
  await accessControlsContract.write.setRoleAdmin(
    [await accessControlsContract.read.CHANNEL_FACTORY_ROLE(), await accessControlsContract.read.CHANNEL_ADMIN_ROLE()],
    { account: accounts.ETSPlatform.account },
  );

  await accessControlsContract.write.setRoleAdmin(
    [await accessControlsContract.read.CHANNEL_ROLE(), await accessControlsContract.read.CHANNEL_FACTORY_ROLE()],
    { account: accounts.ETSPlatform.account },
  );

  // Grant roles
  const channelAdminRole = await accessControlsContract.read.CHANNEL_ADMIN_ROLE();
  const eventProcessorRole = await accessControlsContract.read.EVENT_PROCESSOR_ROLE();
  const smartContractRole = await accessControlsContract.read.SMART_CONTRACT_ROLE();
  const channelFactoryRole = await accessControlsContract.read.CHANNEL_FACTORY_ROLE();

  // Grant CHANNEL_ADMIN_ROLE
  await accessControlsContract.write.grantRole([channelAdminRole, accounts.ETSAdmin.account.address], {
    account: accounts.ETSPlatform.account,
  });
  await accessControlsContract.write.grantRole([channelAdminRole, accounts.ETSPlatform.account.address], {
    account: accounts.ETSPlatform.account,
  });
  await accessControlsContract.write.grantRole([channelAdminRole, accessControls.address], {
    account: accounts.ETSPlatform.account,
  });
  await accessControlsContract.write.grantRole([channelAdminRole, token.address], {
    account: accounts.ETSPlatform.account,
  });

  // Grant EVENT_PROCESSOR_ROLE
  await accessControlsContract.write.grantRole([eventProcessorRole, accounts.ETSPlatform.account.address], {
    account: accounts.ETSPlatform.account,
  });
  await accessControlsContract.write.grantRole([eventProcessorRole, accounts.ETSEventProcessor.account.address], {
    account: accounts.ETSPlatform.account,
  });

  // Grant SMART_CONTRACT_ROLE
  await accessControlsContract.write.grantRole([smartContractRole, accounts.ETSAdmin.account.address], {
    account: accounts.ETSPlatform.account,
  });

  // Grant CHANNEL_FACTORY_ROLE to the factory
  await accessControlsContract.write.grantRole([channelFactoryRole, channelFactory.address], {
    account: accounts.ETSPlatform.account,
  });

  // Set EnrichTarget on Target
  await targetContract.write.setEnrichTarget([enrichTarget.address], { account: accounts.ETSPlatform.account });

  // Set ETS Core on Token
  await tokenContract.write.setETSCore([etsCore.address], { account: accounts.ETSPlatform.account });

  // Create test channels
  await channelFactoryContract.write.addChannel(["ETSChannel"], { account: accounts.ETSPlatform.account });
  await channelFactoryContract.write.addChannel(["SecondTestChannel"], { account: accounts.ETSPlatform.account });

  // Get channel addresses
  const firstChannelAddress = (await accessControlsContract.read.getChannelAddressFromName([
    "ETSChannel",
  ])) as `0x${string}`;
  const secondChannelAddress = (await accessControlsContract.read.getChannelAddressFromName([
    "SecondTestChannel",
  ])) as `0x${string}`;

  // Create channel contract instances
  const etsChannel = await viem.getContractAt("ETSChannel", firstChannelAddress, {
    client: { wallet: accounts.User2 },
  });
  const secondChannel = await viem.getContractAt("ETSChannel", secondChannelAddress, {
    client: { wallet: accounts.User3 },
  });

  // Return in format compatible with existing tests - using the contract instances
  const contracts: IgnitionContracts = {
    WETH: await viem.getContractAt("WETH", weth.address),
    ETSAccessControls: accessControlsContract,
    ETSToken: tokenContract,
    ETSTarget: targetContract,
    ETSEnrichTarget: await viem.getContractAt("ETSEnrichTarget", enrichTarget.address),
    ETS: etsCoreContract,
    ETSChannelFactory: channelFactoryContract,
    ETSChannelImplementation: await viem.getContractAt("ETSChannel", channelImplementation.address),
    ETSChannel: etsChannel,
    secondChannel: secondChannel,
    MockZoraFactory: await viem.getContractAt("MockZoraFactory", mockZoraFactory.address),
  };

  // Get network settings (use localhost chainId)
  const initSettings = getNetworkSettings(31337);

  return { accounts, contracts, initSettings };
}

/**
 * Fixture wrapper for use with Hardhat Network Helpers loadFixture
 */
export async function loadIgnitionFixture() {
  const { networkHelpers } = await network.connect();
  return networkHelpers.loadFixture(ignitionFixture);
}

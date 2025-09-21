import { network } from "hardhat";
import { parseEther } from "viem";
import { getNetworkSettings } from "../../config/settings.js";
import ETSChannelFactoryModule from "../../ignition/modules/ETSChannelFactory.js";
import WETHModule from "../../ignition/modules/WETH.js";
import { type ETSAccounts, getETSAccounts } from "../../utils/accounts.js";

export interface IgnitionContracts {
  WETH: any;
  ETSAccessControls: any;
  ETSToken: any;
  ETSTarget: any;
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
  publicClient: any;
}

/**
 * Load the complete ETS Ignition fixture with proper network context handling
 *
 * IMPORTANT: This function handles network.connect() internally to avoid
 * multiple network instances which cause "no bytecode" issues in tests.
 *
 * The fixture deploys the complete ETS system including:
 * - All core contracts (ETS, ETSTarget, ETSToken, ETSAccessControls)
 * - Channel factory and test channels
 * - Post-deployment configuration (roles, linking)
 * - Returns publicClient for event testing
 */
export async function loadIgnitionFixture(): Promise<IgnitionSetupResult> {
  // Single network.connect() call - critical for proper test execution
  const ctx = await network.connect();
  const { networkHelpers, ignition, viem } = ctx;

  // Create fixture function that uses the same context
  async function fixture() {
    // Get wallet clients for account setup
    const walletClients = await viem.getWalletClients();
    const accounts = getETSAccounts(walletClients);

    // Get public client for the tests
    const publicClient = await viem.getPublicClient();

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

    // Get contract instances for post-deployment setup
    const accessControlsContract = await viem.getContractAt("ETSAccessControls", accessControls.address);
    const targetContract = await viem.getContractAt("ETSTarget", target.address);
    const tokenContract = await viem.getContractAt("ETSToken", token.address);
    const etsCoreContract = await viem.getContractAt("ETS", etsCore.address);
    const channelFactoryContract = await viem.getContractAt("ETSChannelFactory", channelFactory.address);

    // ============ POST-DEPLOYMENT CONFIGURATION ============

    // Set role admins
    await accessControlsContract.write.setRoleAdmin(
      [
        await accessControlsContract.read.CHANNEL_FACTORY_ROLE(),
        await accessControlsContract.read.CHANNEL_ADMIN_ROLE(),
      ],
      { account: accounts.ETSPlatform.account },
    );

    await accessControlsContract.write.setRoleAdmin(
      [await accessControlsContract.read.CHANNEL_ROLE(), await accessControlsContract.read.CHANNEL_FACTORY_ROLE()],
      { account: accounts.ETSPlatform.account },
    );

    // Grant roles
    const channelFactoryRole = await accessControlsContract.read.CHANNEL_FACTORY_ROLE();
    const eventProcessorRole = await accessControlsContract.read.EVENT_PROCESSOR_ROLE();
    const smartContractRole = await accessControlsContract.read.SMART_CONTRACT_ROLE();

    // Grant ETSPlatform the CHANNEL_ADMIN_ROLE
    const channelAdminRole = await accessControlsContract.read.CHANNEL_ADMIN_ROLE();
    await accessControlsContract.write.grantRole([channelAdminRole, accounts.ETSPlatform.account.address], {
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

    // Return in format compatible with existing tests
    const contracts: IgnitionContracts = {
      WETH: await viem.getContractAt("WETH", weth.address),
      ETSAccessControls: accessControlsContract,
      ETSToken: tokenContract,
      ETSTarget: targetContract,
      ETS: etsCoreContract,
      ETSChannelFactory: channelFactoryContract,
      ETSChannelImplementation: await viem.getContractAt("ETSChannel", channelImplementation.address),
      ETSChannel: etsChannel,
      secondChannel: secondChannel,
      MockZoraFactory: await viem.getContractAt("MockZoraFactory", mockZoraFactory.address),
    };

    // Get network settings
    const initSettings = getNetworkSettings(31337);

    return { accounts, contracts, initSettings, publicClient };
  }

  // Use networkHelpers.loadFixture for test optimization
  return networkHelpers.loadFixture(fixture);
}

export type IgnitionFixture = Awaited<ReturnType<typeof loadIgnitionFixture>>;

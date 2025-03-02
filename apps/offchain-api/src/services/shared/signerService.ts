import type { SupportedChainId } from "@ethereum-tag-service/contracts/multiChainConfig";
import { ethers } from "ethers";
import { config } from "../../config";
import { logger } from "../../utils/logger";

/**
 * Creates a provider with fallback options
 */
async function createProviderWithFallback(
  primaryUrl: string,
  fallbackUrls: string[],
  chainId: number,
): Promise<ethers.providers.Provider> {
  try {
    const provider = new ethers.providers.JsonRpcProvider(primaryUrl, chainId);
    await provider.getNetwork(); // Test the connection
    logger.info(`Successfully connected to primary RPC for chainId ${chainId}`);
    return provider;
  } catch (error) {
    logger.warn(
      `Failed to connect to primary RPC for chainId ${chainId}: ${error instanceof Error ? error.message : String(error)}`,
    );
    logger.info("Trying fallback RPCs...");

    for (const url of fallbackUrls) {
      try {
        const provider = new ethers.providers.JsonRpcProvider(url, chainId);
        await provider.getNetwork(); // Test the connection
        logger.info(`Successfully connected to fallback RPC ${url} for chainId ${chainId}`);
        return provider;
      } catch (fallbackError) {
        logger.warn(
          `Failed to connect to fallback RPC ${url} for chainId ${chainId}: ${
            fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
          }`,
        );
      }
    }
    throw new Error(`Failed to connect to any RPC for chainId ${chainId}`);
  }
}

/**
 * Creates a signer for the specified chain ID
 */
export async function createSigner(chainId: number): Promise<ethers.Signer> {
  logger.info(`Creating signer for chain ID ${chainId}`);

  if (!config.chains.isChainSupported(chainId)) {
    const validNetworkNames = config.chains.availableChainIds.map(
      (id) => config.chains.chainDetails[id as SupportedChainId].name,
    );
    throw new Error(`Unsupported chainId: ${chainId}. Supported networks are: ${validNetworkNames.join(", ")}.`);
  }

  // Get the primary RPC URL for this chain
  const primaryUrl = config.chains.getRpcUrlForChain(chainId);
  if (!primaryUrl) {
    throw new Error(`No RPC URL configured for chainId ${chainId}`);
  }

  // Get any fallback URLs
  const fallbackUrls = config.chains.getFallbackRpcUrls(chainId);

  // Create the provider
  const provider = await createProviderWithFallback(primaryUrl, fallbackUrls, chainId);

  // Create the signer using the private key
  if (!config.privateKey) {
    throw new Error("Private key is not configured");
  }

  const signer = new ethers.Wallet(config.privateKey, provider);

  // Log some information about the connection
  const address = await signer.getAddress();
  logger.info(`Signer created with address ${address}`);

  const balance = await signer.getBalance();
  logger.info(`Signer balance: ${ethers.utils.formatEther(balance)} ETH`);

  return signer;
}

import { logger } from "../../utils/logger";
import type { IZoraService } from "./IZoraService";
import { ZoraContractsService } from "./zoraContractsService";
import { ZoraSDKService } from "./zoraSDKService";

export type ZoraServiceType = "SDK" | "FACTORY";

/**
 * Create a Zora service instance based on the specified type
 * Allows switching between SDK and Factory implementations
 */
export function createZoraService(
  serviceType: ZoraServiceType,
  privateKey: `0x${string}`,
  chainId = 8453,
  metadataApiUrl = "http://localhost:3000/api/metadata",
): IZoraService {
  logger.info("Creating Zora service", {
    serviceType,
    chainId,
    metadataApiUrl,
  });

  switch (serviceType) {
    case "SDK":
      return new ZoraSDKService(privateKey, chainId, metadataApiUrl);
    case "FACTORY":
      return new ZoraContractsService(privateKey, chainId, metadataApiUrl);
    default:
      throw new Error(`Unknown Zora service type: ${serviceType}`);
  }
}

/**
 * Create a Zora service instance from environment configuration
 */
export function createZoraServiceFromEnv(
  privateKey: `0x${string}`,
  chainId = 8453,
  metadataApiUrl = "http://localhost:3000/api/metadata",
): IZoraService {
  const serviceType = (process.env.ZORA_SERVICE_TYPE?.toUpperCase() as ZoraServiceType) || "SDK";

  logger.info("Creating Zora service from environment", {
    serviceType,
    chainId,
    envVar: process.env.ZORA_SERVICE_TYPE,
  });

  return createZoraService(serviceType, privateKey, chainId, metadataApiUrl);
}

import type { ContextAwareFetcher } from "@app/utils/fetchers";
import type { NetworkName } from "@ethereum-tag-service/contracts/multiChainConfig";
export type ServerEnvironment = "localhost" | "staging" | "production";
export type EnvironmentContextType = {
  serverEnvironment: ServerEnvironment;
  network: NetworkName | "none";
  isIndexPage: boolean;
  isLocalhost: boolean;
  isStaging: boolean;
  isProduction: boolean;
  subdomain: string | null;
  isValidPathWithoutNetwork: boolean;
};

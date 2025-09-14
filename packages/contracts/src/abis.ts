import ETSCoreArtifact from "../artifacts/contracts/ETS.sol/ETS.json";
// Export contract ABIs
import ETSAccessControlsArtifact from "../artifacts/contracts/ETSAccessControls.sol/ETSAccessControls.json";
import ETSEnrichTargetArtifact from "../artifacts/contracts/ETSEnrichTarget.sol/ETSEnrichTarget.json";
import ETSRelayerFactoryArtifact from "../artifacts/contracts/ETSRelayerFactory.sol/ETSRelayerFactory.json";
import ETSTargetArtifact from "../artifacts/contracts/ETSTarget.sol/ETSTarget.json";
import ETSTokenArtifact from "../artifacts/contracts/ETSToken.sol/ETSToken.json";
import ETSRelayerArtifact from "../artifacts/contracts/relayers/ETSRelayer.sol/ETSRelayer.json";

export const ETSAccessControlsABI = ETSAccessControlsArtifact.abi;
export const ETSTokenABI = ETSTokenArtifact.abi;
export const ETSTargetABI = ETSTargetArtifact.abi;
export const ETSCoreABI = ETSCoreArtifact.abi;
export const ETSEnrichTargetABI = ETSEnrichTargetArtifact.abi;
export const ETSRelayerABI = ETSRelayerArtifact.abi;
export const ETSRelayerFactoryABI = ETSRelayerFactoryArtifact.abi;

// Helper function to get ABI by contract name
export function getContractABI(contractName: string) {
  switch (contractName) {
    case "ETSAccessControls":
    case "accessControls":
      return ETSAccessControlsABI;
    case "ETSToken":
    case "token":
      return ETSTokenABI;
    case "ETSTarget":
    case "target":
      return ETSTargetABI;
    case "ETS":
    case "ETSCore":
    case "core":
      return ETSCoreABI;
    case "ETSEnrichTarget":
    case "enrichTarget":
      return ETSEnrichTargetABI;
    case "ETSRelayer":
    case "relayer":
      return ETSRelayerABI;
    case "ETSRelayerFactory":
    case "relayerFactory":
      return ETSRelayerFactoryABI;
    default:
      throw new Error(`Unknown contract: ${contractName}`);
  }
}

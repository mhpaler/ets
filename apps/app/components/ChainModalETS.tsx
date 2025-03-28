import { useEnvironmentContext } from "@app/context/EnvironmentContext";
import { getChainInfo } from "@app/utils/getChainInfo";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

interface ChainModalETSProps {
  show: boolean;
  onClose: () => void;
  asModal?: boolean;
}

const ChainModalETS: React.FC<ChainModalETSProps> = ({ show, onClose, asModal = true }) => {
  const { serverEnvironment, network } = useEnvironmentContext();
  const router = useRouter();

  // Check if we're on localhost regardless of detected environment
  const isOnLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname.endsWith(".localhost"));

  // Debug what environment we're in
  console.info("ChainModalETS Debug:", {
    serverEnvironment,
    network,
    isOnLocalhost,
    hostname: typeof window !== "undefined" ? window.location.hostname : "server-side",
    asPath: router.asPath,
    pathname: router.pathname,
  });

  if (!show) return null;

  // Improved link rendering function that sets the correct network/environment combination
  const renderChainLink = (baseUrl: string, chainNetwork: string, targetEnvironment: string) => {
    const { iconPath, displayName } = getChainInfo(chainNetwork);

    // Check for active state based on network, environment, AND domain
    // This ensures only the exact link that matches current URL is active
    let isActive = false;

    // Get the current hostname
    const currentHostname = typeof window !== "undefined" ? window.location.hostname : "";

    // Extract domain from the target URL
    const urlDomain = baseUrl.split("//")[1]?.split("/")[0];

    // First, check if network and environment match
    const networkMatch =
      targetEnvironment === "staging"
        ? network === chainNetwork || network === `${chainNetwork}staging`
        : network === chainNetwork;

    // Then, check if domain matches
    // For localhost environments, also check the subdomain
    if (networkMatch && serverEnvironment === targetEnvironment) {
      if (isOnLocalhost && urlDomain?.endsWith(".localhost")) {
        // For localhost, check if the subdomain matches
        const targetSubdomain = urlDomain.split(".")[0];
        const currentSubdomain = currentHostname.split(".")[0];

        isActive = targetSubdomain === currentSubdomain;
      } else if (urlDomain?.includes("stage.app") && currentHostname?.includes("stage.app")) {
        // For staging on Vercel
        isActive = true;
      } else if (
        !urlDomain?.includes("stage.app") &&
        !currentHostname?.includes("stage.app") &&
        !urlDomain?.includes(".localhost") &&
        !currentHostname?.includes(".localhost")
      ) {
        // For production
        isActive = true;
      }
    }

    // Log the active state determination for debugging
    console.info("Link active check:", {
      buttonNetwork: chainNetwork,
      buttonEnvironment: targetEnvironment,
      currentNetwork: network,
      currentEnvironment: serverEnvironment,
      currentHostname,
      targetUrlDomain: urlDomain,
      networkMatch,
      isActive,
    });

    // Use router.asPath instead of router.pathname to get the full URL including dynamic segments
    const url = `${baseUrl}${router.asPath}`;

    const linkClasses = `card card-compact border transition-all duration-200 ${
      isActive ? "bg-base-300 cursor-not-allowed" : "hover:bg-base-200 hover:text-gray-950 hover:-translate-y-1"
    }`;

    const handleClick = (e: React.MouseEvent) => {
      if (!isActive) {
        // Enhanced debugging for network switching
        console.info("ChainModal Navigation:", {
          from: {
            network,
            environment: serverEnvironment,
            url: window.location.href,
            hostname: window.location.hostname,
          },
          to: {
            network: chainNetwork,
            environment: targetEnvironment,
            url,
            targetHostname: url.split("//")[1].split("/")[0],
            targetSubdomain: url.split("//")[1].split(".")[0],
          },
          expectedMapping:
            targetEnvironment === "staging"
              ? `${chainNetwork} → ${chainNetwork === "arbitrumsepolia" ? "arbitrumsepoliastaging" : chainNetwork === "basesepolia" ? "basesepoliastaging" : chainNetwork}`
              : "No mapping needed (production or localhost environment)",
        });

        e.preventDefault();
        router.push(url);
        onClose();
      }
    };

    return (
      <div className={linkClasses}>
        <div className="card-body">
          {isActive ? (
            <div className="flex items-center space-x-2 text-gray-500">
              <Image src={iconPath} alt={`${displayName} icon`} width={24} height={24} />
              <span className="text-sm opacity-75">{displayName} (Current)</span>
            </div>
          ) : (
            <Link className="flex items-center space-x-2" href={url} onClick={handleClick}>
              <Image src={iconPath} alt={`${displayName} icon`} width={24} height={24} />
              <span className="text-sm opacity-75">{displayName}</span>
            </Link>
          )}
        </div>
      </div>
    );
  };

  // Create a debug panel that shows current environment state
  const debugPanel = (
    <div className="mt-4 p-3 border border-gray-300 rounded-md bg-gray-100 text-xs font-mono">
      <h3 className="font-bold mb-2">Environment Debug</h3>
      <div className="grid grid-cols-2 gap-1">
        <div className="font-semibold">Hostname:</div>
        <div>{typeof window !== "undefined" ? window.location.hostname : "server-side"}</div>

        <div className="font-semibold">Current Network:</div>
        <div className="text-blue-600">{network}</div>

        <div className="font-semibold">Environment:</div>
        <div className="text-green-600">{serverEnvironment}</div>

        <div className="font-semibold">Chain ID:</div>
        <div>
          {network === "hardhat"
            ? "31337"
            : network === "arbitrumsepolia" || network === "arbitrumsepoliastaging"
              ? "421614"
              : network === "basesepolia" || network === "basesepoliastaging"
                ? "84532"
                : "unknown"}
        </div>

        <div className="font-semibold">SDK Contract Key:</div>
        <div className="text-red-600">{`${
          network === "hardhat"
            ? "31337"
            : network === "arbitrumsepolia" || network === "arbitrumsepoliastaging"
              ? "421614"
              : network === "basesepolia" || network === "basesepoliastaging"
                ? "84532"
                : "unknown"
        }_${serverEnvironment}`}</div>

        <div className="font-semibold">Mapped Network:</div>
        <div className="text-purple-600">
          {serverEnvironment === "staging"
            ? network === "arbitrumsepolia"
              ? "arbitrumsepoliastaging"
              : network === "basesepolia"
                ? "basesepoliastaging"
                : network
            : network}
        </div>
      </div>
    </div>
  );

  const content = (
    <div className={asModal ? "space-y-4" : "space-y-6"}>
      <h2 className="text-lg font-medium mb-4">Select a Network</h2>

      {/* Show debug panel only in development environments (localhost or staging) */}
      {(isOnLocalhost || serverEnvironment === "staging") && debugPanel}

      {/* Local Development Environment - Always show when on localhost */}
      {isOnLocalhost && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Local Development</p>
          {/* Group all localhost networks together for easier access */}
          {renderChainLink("http://hardhat.localhost:3001", "hardhat", "localhost")}
          {renderChainLink("http://arbitrumsepolia.localhost:3001", "arbitrumsepolia", "staging")}
          {renderChainLink("http://basesepolia.localhost:3001", "basesepolia", "staging")}

          {/* Links to remote environments for comparison */}
          <p className="text-sm font-medium mt-4">Staging on Vercel</p>
          {renderChainLink("https://arbitrumsepolia.stage.app.ets.xyz", "arbitrumsepolia", "staging")}
          {renderChainLink("https://basesepolia.stage.app.ets.xyz", "basesepolia", "staging")}
          <p className="text-sm font-medium mt-4">Production on Vercel</p>
          {renderChainLink("https://arbitrumsepolia.app.ets.xyz", "arbitrumsepolia", "production")}
          {renderChainLink("https://basesepolia.app.ets.xyz", "basesepolia", "production")}
        </div>
      )}

      {/* Staging Environment */}
      {serverEnvironment === "staging" && !isOnLocalhost && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Staging Networks</p>
          {renderChainLink("https://arbitrumsepolia.stage.app.ets.xyz", "arbitrumsepolia", "staging")}
          {renderChainLink("https://basesepolia.stage.app.ets.xyz", "basesepolia", "staging")}

          <p className="text-sm font-medium mt-4">Production Networks</p>
          {renderChainLink("https://arbitrumsepolia.app.ets.xyz", "arbitrumsepolia", "production")}
          {renderChainLink("https://basesepolia.app.ets.xyz", "basesepolia", "production")}
        </div>
      )}

      {/* Production Environment */}
      {serverEnvironment === "production" && !isOnLocalhost && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Production Networks</p>
          {renderChainLink("https://arbitrumsepolia.app.ets.xyz", "arbitrumsepolia", "production")}
          {renderChainLink("https://basesepolia.app.ets.xyz", "basesepolia", "production")}
        </div>
      )}

      {asModal && (
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      )}
    </div>
  );

  return asModal ? (
    <div className="modal modal-open">
      <div className="modal-box w-96">{content}</div>
    </div>
  ) : (
    content
  );
};

export default ChainModalETS;

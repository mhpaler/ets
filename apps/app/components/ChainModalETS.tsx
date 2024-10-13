import { getChainInfo } from "@app/utils/getChainInfo";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ChainModalETSProps {
  show: boolean;
  onClose: () => void;
  asModal?: boolean; // Controls whether displayed as modal or inline content
}

const ChainModalETS: React.FC<ChainModalETSProps> = ({ show, onClose, asModal = true }) => {
  const [environment, setEnvironment] = useState<"localhost" | "staging" | "production">("production");

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname.endsWith(".localhost")) {
      setEnvironment("localhost");
    } else if (hostname.endsWith(".stage.app.ets.xyz")) {
      setEnvironment("staging");
    } else if (hostname.endsWith(".app.ets.xyz")) {
      setEnvironment("production");
    }

    console.info("ChainModalETS - Detected Environment:", environment);
    console.info("ChainModalETS - Hostname:", hostname);
  }, [environment]);

  if (!show) return null;

  const renderChainLink = (url: string, subdomain: string) => {
    const { iconPath, displayName } = getChainInfo(subdomain);
    console.info(`Rendering link for ${displayName} with URL: ${url}, Icon Path: ${iconPath}`);

    return (
      <a
        className="card card-compact border hover:bg-base-200 transition-all duration-200 text-gray-600 hover:text-gray-950 hover:-translate-y-1"
        href={url}
      >
        <div className="card-body">
          <Link className="flex items-center space-x-2" href={url}>
            <Image src={iconPath} alt={`${displayName} icon`} width={24} height={24} />
            <span className="text-sm opacity-75">{displayName}</span>
          </Link>
        </div>
      </a>
    );
  };

  const content = (
    <div className={asModal ? "space-y-4" : "space-y-6"}>
      <h2 className="text-lg font-medium mb-4">Select a Network</h2>

      {/* Localhost buttons - include localhost, staging, and production links */}
      {environment === "localhost" && (
        <div className="space-y-2">
          <p className="text-sm">Localhost</p>
          {renderChainLink("http://arbitrumsepolia.localhost:3000", "arbitrumsepolia")}
          {renderChainLink("http://basesepolia.localhost:3000", "basesepolia")}
          {renderChainLink("http://hardhat.localhost:3000", "hardhat")}

          <p className="text-sm mt-4">Staging on Vercel</p>
          {renderChainLink("https://arbitrumsepolia.stage.app.ets.xyz", "arbitrumsepolia")}
          {renderChainLink("https://basesepolia.stage.app.ets.xyz", "basesepolia")}

          <p className="text-sm mt-4">Production on Vercel</p>
          {renderChainLink("https://arbitrumsepolia.app.ets.xyz", "arbitrumsepolia")}
          {renderChainLink("https://basesepolia.app.ets.xyz", "basesepolia")}
        </div>
      )}

      {/* Staging buttons - include staging and production links only */}
      {environment === "staging" && (
        <div className="space-y-2">
          <p className="text-sm">Staging on Vercel</p>
          {renderChainLink("https://arbitrumsepolia.stage.app.ets.xyz", "arbitrumsepolia")}
          {renderChainLink("https://basesepolia.stage.app.ets.xyz", "basesepolia")}

          <p className="text-sm mt-4">Production on Vercel</p>
          {renderChainLink("https://arbitrumsepolia.app.ets.xyz", "arbitrumsepolia")}
          {renderChainLink("https://basesepolia.app.ets.xyz", "basesepolia")}
        </div>
      )}

      {/* Production buttons - include production links only */}
      {environment === "production" && (
        <div className="space-y-2">
          <p className="text-sm">Production on Vercel</p>
          {renderChainLink("https://arbitrumsepolia.app.ets.xyz", "arbitrumsepolia")}
          {renderChainLink("https://basesepolia.app.ets.xyz", "basesepolia")}
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

import { getChainInfo } from "@app/utils/getChainInfo";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ChainModalETSProps {
  show: boolean;
  onClose: () => void;
  asModal?: boolean; // Add a prop to control modal styling
}

const ChainModalETS: React.FC<ChainModalETSProps> = ({ show, onClose, asModal = true }) => {
  const [environment, setEnvironment] = useState<"localhost" | "staging" | "production">("production");

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname.endsWith(".localhost")) {
      setEnvironment("localhost");
    } else if (hostname.includes(".stage.app.ets.xyz")) {
      setEnvironment("staging");
    } else if (hostname.includes(".app.ets.xyz")) {
      setEnvironment("production");
    }
  }, []);

  if (!show) return null;

  // Helper function to render a chain link with dynamic icon and name
  const renderChainLink = (url: string, subdomain: string) => {
    const { iconPath, displayName } = getChainInfo(subdomain);
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

      {/* Localhost buttons */}
      {environment === "localhost" && (
        <div className="space-y-2">
          <p className="text-sm">Localhost</p>
          {renderChainLink("http://arbitrumsepolia.localhost:3000", "arbitrumsepolia")}
          {renderChainLink("http://basesepolia.localhost:3000", "basesepolia")}
          {renderChainLink("http://hardhat.localhost:3000", "hardhat")}
        </div>
      )}

      {/* Staging buttons */}
      {(environment === "staging" || environment === "localhost") && (
        <div className="space-y-2">
          <p className="text-sm">Staging on Vercel</p>
          {renderChainLink("https://arbitrumsepolia.stage.app.ets.xyz", "arbitrumsepolia")}
          {renderChainLink("https://basesepolia.stage.app.ets.xyz", "basesepolia")}
        </div>
      )}

      {/* Production buttons */}
      {(environment === "production" || environment === "staging" || environment === "localhost") && (
        <div className="space-y-2">
          {(environment === "staging" || environment === "localhost") && (
            <p className="text-sm">Production on Vercel</p>
          )}
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

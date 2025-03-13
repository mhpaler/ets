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

  if (!show) return null;

  const renderChainLink = (baseUrl: string, chainNetwork: string, targetEnvironment: string) => {
    const { iconPath, displayName } = getChainInfo(chainNetwork);
    const isActive = network === chainNetwork && serverEnvironment === targetEnvironment;

    // Use router.asPath instead of router.pathname to get the full URL including dynamic segments
    const url = `${baseUrl}${router.asPath}`;

    const linkClasses = `card card-compact border transition-all duration-200 ${
      isActive ? "bg-base-300 cursor-not-allowed" : "hover:bg-base-200 hover:text-gray-950 hover:-translate-y-1"
    }`;

    const handleClick = (e: React.MouseEvent) => {
      if (!isActive) {
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

  const content = (
    <div className={asModal ? "space-y-4" : "space-y-6"}>
      <h2 className="text-lg font-medium mb-4">Select a Network</h2>

      {serverEnvironment === "localhost" && (
        <div className="space-y-2">
          <p className="text-sm">Environment: Localhost</p>
          {renderChainLink("http://arbitrumsepolia.localhost:3001", "arbitrumsepolia", "localhost")}
          {renderChainLink("http://basesepolia.localhost:3001", "basesepolia", "localhost")}
          {renderChainLink("http://hardhat.localhost:3001", "hardhat", "localhost")}

          <p className="text-sm mt-4">Environment: Staging on Vercel</p>
          {renderChainLink("https://arbitrumsepolia.stage.app.ets.xyz", "arbitrumsepolia", "staging")}
          {renderChainLink("https://basesepolia.stage.app.ets.xyz", "basesepolia", "staging")}

          <p className="text-sm mt-4">Environment: Production on Vercel</p>
          {renderChainLink("https://arbitrumsepolia.app.ets.xyz", "arbitrumsepolia", "production")}
          {renderChainLink("https://basesepolia.app.ets.xyz", "basesepolia", "production")}
        </div>
      )}

      {serverEnvironment === "staging" && (
        <div className="space-y-2">
          <p className="text-sm">Staging</p>
          {renderChainLink("https://arbitrumsepolia.stage.app.ets.xyz", "arbitrumsepolia", "staging")}
          {renderChainLink("https://basesepolia.stage.app.ets.xyz", "basesepolia", "staging")}

          <p className="text-sm mt-4">Production</p>
          {renderChainLink("https://arbitrumsepolia.app.ets.xyz", "arbitrumsepolia", "production")}
          {renderChainLink("https://basesepolia.app.ets.xyz", "basesepolia", "production")}
        </div>
      )}

      {serverEnvironment === "production" && (
        <div className="space-y-2">
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

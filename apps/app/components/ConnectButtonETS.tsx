import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

interface ConnectButtonETSProps {
  className?: string;
  compact?: boolean;
}

export const ConnectButtonETS: React.FC<ConnectButtonETSProps> = ({ className = "", compact = false }) => {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");

        const handleConnectClick = (event: React.MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation();
          openConnectModal();
        };

        if (!ready) return null;

        if (!connected) {
          return (
            <button className={`btn btn-primary ${className}`} onClick={handleConnectClick} type="button">
              {compact ? "Connect" : "Connect Wallet"}
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button className={`btn btn-warning btn-outline ${className}`} onClick={openChainModal} type="button">
              Wrong network
            </button>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <button
              className={`btn ${compact ? "btn-sm px-2" : ""} ${className}`}
              onClick={openChainModal}
              type="button"
            >
              {chain.hasIcon && (
                <div
                  style={{
                    background: chain.iconBackground,
                    width: 16,
                    height: 16,
                    borderRadius: 999,
                    overflow: "hidden",
                    marginRight: compact ? 0 : 4,
                  }}
                >
                  {chain.iconUrl && (
                    <Image src={chain.iconUrl} alt={chain.name ?? "Chain icon"} width={16} height={16} />
                  )}
                </div>
              )}
              {!compact && chain.name}
            </button>
            <button
              className={`btn ${className} ${compact ? "btn-sm px-2" : ""}`}
              onClick={openAccountModal}
              type="button"
            >
              {compact ? (
                <div className="avatar">
                  <div className="w-6 rounded-full">
                    <img src={`https://avatar.vercel.sh/${account.address}.svg`} alt="User avatar" />
                  </div>
                </div>
              ) : (
                <>
                  {account.displayName}
                  {account.displayBalance ? ` (${account.displayBalance})` : ""}
                </>
              )}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

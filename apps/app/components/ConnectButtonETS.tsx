import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// Add props parameter to your function and destructure it to get className or any other prop you might pass
export const ConnectButtonETS = ({ className = "" }) => {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");

        // Custom click handler
        const handleConnectClick = (event: React.MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation(); // Stop event propagation
          openConnectModal(); // Forward the call to openConnectModal
        };

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                // Use template literals to include both the default and passed-in class names
                return (
                  <button className={`btn btn-primary ${className}`} onClick={handleConnectClick} type="button">
                    Connect Wallet
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
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    className={`btn btn-sm`}
                    onClick={openChainModal}
                    style={{ display: "flex", alignItems: "center" }}
                    type="button"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: "hidden",
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <Image src={chain.iconUrl} alt={chain.name ?? "Chain icon"} width={12} height={12} />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>
                  <button className={`btn ${className}`} onClick={openAccountModal} type="button">
                    {account.displayName}
                    {account.displayBalance ? ` (${account.displayBalance})` : ""}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

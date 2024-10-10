import ChainModalETS from "@app/components/ChainModalETS";
import { getChainInfo } from "@app/utils/getChainInfo";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useState } from "react";
import { useDisconnect, useSwitchChain } from "wagmi";

interface ConnectButtonETSProps {
  className?: string;
  compact?: boolean;
}

export const ConnectButtonETS: React.FC<ConnectButtonETSProps> = ({ className = "", compact = false }) => {
  const { switchChain } = useSwitchChain();
  const { chain: expectedChain } = getChainInfo();

  const { disconnect } = useDisconnect();

  const [showChainModal, setShowChainModal] = useState(false);
  const [showUnsupportedModal, setShowUnsupportedModal] = useState(false);

  const handleSwitchNetwork = () => {
    if (expectedChain?.id) {
      switchChain({ chainId: expectedChain.id });
    }
    setShowUnsupportedModal(false); // Close the modal after switching
  };

  const openChainModalETS = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowChainModal(true);
  };

  const closeChainModalETS = () => setShowChainModal(false);

  return (
    <>
      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, openConnectModal, authenticationStatus, mounted }) => {
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
              <div className="flex space-x-2">
                <button
                  className={`btn btn-primary btn-outline ${className}`}
                  onClick={openChainModalETS}
                  type="button"
                >
                  Select Network
                </button>
                <button className={`btn btn-primary ${className}`} onClick={handleConnectClick} type="button">
                  {compact ? "Connect" : "Connect Wallet"}
                </button>
              </div>
            );
          }

          // Display a "Wrong network" button if the chain is unsupported
          if (chain.unsupported) {
            return (
              <div className="flex space-x-2">
                <button
                  className={`btn btn-warning ${className}`}
                  onClick={() => setShowUnsupportedModal(true)} // Open unsupported modal on click
                  type="button"
                >
                  Wrong network
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
          }

          return (
            <div className="flex items-center gap-2">
              <button
                className={`btn ${compact ? "btn-sm px-2" : ""} ${className}`}
                onClick={openChainModalETS}
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

      {/* DaisyUI Modal for network switching */}
      <ChainModalETS show={showChainModal} onClose={closeChainModalETS} />

      {/* Custom Unsupported Network Modal */}
      {showUnsupportedModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Switch Network</h3>
            <p className="py-4">Wrong network detected, switch or disconnect to continue. </p>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={handleSwitchNetwork}>
                {expectedChain?.name || "Supported Network"}
              </button>
              <button className="btn" onClick={() => disconnect()}>
                Disconnect
              </button>
              <button className="btn" onClick={() => setShowUnsupportedModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

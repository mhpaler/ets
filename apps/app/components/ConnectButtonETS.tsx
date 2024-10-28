import ChainModalETS from "@app/components/ChainModalETS";
import { useEnvironmentContext } from "@app/context/EnvironmentContext";
import { getChainInfo } from "@app/utils/getChainInfo";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useChainId, useDisconnect, useSwitchChain } from "wagmi";

interface ConnectButtonETSProps {
  className?: string;
  compact?: boolean;
}

export const ConnectButtonETS: React.FC<ConnectButtonETSProps> = ({ className = "", compact = false }) => {
  const { switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();
  const { network } = useEnvironmentContext();
  const expectedChain = useMemo(() => getChainInfo(network), [network]);
  const chainId = useChainId();
  const { isConnected, isReconnecting } = useAccount();
  const [showChainModal, setShowChainModal] = useState(false);
  const [showUnsupportedModal, setShowUnsupportedModal] = useState(false);

  const handleSwitchNetwork = useCallback(() => {
    if (expectedChain?.chain.id) {
      try {
        switchChain({ chainId: expectedChain.chain.id });
        setShowUnsupportedModal(false);
      } catch (error) {
        console.error("Failed to switch chain:", error);
        setShowUnsupportedModal(true);
      }
    } else {
      setShowUnsupportedModal(true);
    }
  }, [expectedChain, switchChain]);

  useEffect(() => {
    if (isConnected && !isReconnecting && chainId && expectedChain && chainId !== expectedChain.chain.id) {
      handleSwitchNetwork();
    }
  }, [chainId, isConnected, isReconnecting, expectedChain, handleSwitchNetwork]);

  const openChainModalETS = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowChainModal(true);
  }, []);

  const closeChainModalETS = useCallback(() => setShowChainModal(false), []);

  return (
    <>
      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, openConnectModal, authenticationStatus, mounted }) => {
          const ready = mounted && authenticationStatus !== "loading";
          const connected =
            ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");

          const isWrongNetwork = connected && expectedChain && chain.id !== expectedChain.chain.id;

          const handleConnectClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            openConnectModal();
          };

          if (!ready) return null;

          if (!connected) {
            return (
              <div className="flex space-x-2">
                <button
                  className={`btn ${compact ? "btn-sm px-2" : ""} ${className}`}
                  onClick={openChainModalETS}
                  type="button"
                >
                  {expectedChain.iconPath && (
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 999,
                        overflow: "hidden",
                        marginRight: compact ? 0 : 4,
                      }}
                    >
                      {expectedChain.iconPath && (
                        <Image
                          src={expectedChain.iconPath}
                          alt={expectedChain.displayName ?? "Chain icon"}
                          width={16}
                          height={16}
                        />
                      )}
                    </div>
                  )}
                  {!compact && expectedChain.displayName}
                </button>
                <button className={`btn btn-primary ${className}`} onClick={handleConnectClick} type="button">
                  {compact ? "Connect" : "Connect Wallet"}
                </button>
              </div>
            );
          }

          if (isWrongNetwork) {
            console.info("Wrong network detected");
            console.info("Connected chain:", chain);
            console.info("Expected chain:", expectedChain);
            return (
              <div className="flex space-x-2">
                <button
                  className={`btn btn-warning ${className}`}
                  onClick={() => setShowUnsupportedModal(true)}
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

      <ChainModalETS show={showChainModal} onClose={closeChainModalETS} />

      {showUnsupportedModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Switch Network</h3>
            <p className="py-4">Wrong network detected. Expected network: {expectedChain?.displayName}</p>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={handleSwitchNetwork}>
                Switch to {expectedChain?.displayName || "Supported Network"}
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

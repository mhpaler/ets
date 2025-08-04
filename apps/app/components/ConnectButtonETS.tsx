/**
 * ConnectButtonETS
 *
 * A customized wallet connection button built on RainbowKit that handles:
 * - Wallet connection/disconnection
 * - Network switching
 * - Account display
 * - Compact/Full display modes
 *
 * Used throughout the app for wallet connectivity, with optional chain switching
 * functionality for header placement.
 *
 * * @example Basic usage
 * <ConnectButtonETS />
 *
 * @example Header usage with chain switcher
 * <ConnectButtonETS
 *   showChainSwitcher={true}
 *   compact={isCompact}
 *   className="btn-primary"
 * />
 *
 * @example Compact mode for mobile
 * <ConnectButtonETS compact={true} />
 */

import { useEnvironmentContext } from "@app/context/EnvironmentContext";
import { getChainInfo } from "@app/utils/getChainInfo";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useChainId, useDisconnect, useSwitchChain } from "wagmi";

interface ConnectButtonETSProps {
  /** Custom CSS classes to apply to the button */
  className?: string;
  /** Enable compact mode for mobile/tight spaces */
  compact?: boolean;
}

export const ConnectButtonETS: React.FC<ConnectButtonETSProps> = ({
  className = "",
  compact = false,
}) => {
  const { switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();
  const { network, serverEnvironment } = useEnvironmentContext();

  // Log more information about environment context for debugging
  useEffect(() => {
    console.info("ConnectButtonETS Environment:", {
      network,
      serverEnvironment,
      location: typeof window !== "undefined" ? window.location.href : "server-side",
    });
  }, [network, serverEnvironment]);

  const expectedChain = useMemo(() => {
    const chainInfo = getChainInfo(network);
    console.info("ConnectButtonETS Chain Info:", {
      network,
      resolvedChainId: chainInfo.chain.id,
      displayName: chainInfo.displayName,
    });
    return chainInfo;
  }, [network]);
  const chainId = useChainId();
  const { isConnected, isReconnecting } = useAccount();
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
              <button className={`btn btn-primary ${className}`} onClick={handleConnectClick} type="button">
                {compact ? "Connect" : "Connect Wallet"}
              </button>
            );
          }

          if (isWrongNetwork) {
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
          );
        }}
      </ConnectButton.Custom>


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

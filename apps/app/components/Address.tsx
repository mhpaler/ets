import { CopyAndPaste } from "@app/components/CopyAndPaste";
import { Truncate } from "@app/components/Truncate";
import { getExplorerUrl } from "@app/config/wagmiConfig";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Hex } from "viem";
import { useChainId } from "wagmi";
import { URI } from "./URI";

interface AddressProps {
  address?: string | Hex;
  ens?: string | null;
  truncateLength?: number;
}

const Address: React.FC<AddressProps> = ({ address, ens, truncateLength = 14 }) => {
  const [showAddressTooltip, setShowAddressTooltip] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [showLinkTooltip, setShowLinkTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const spanRef = useRef<HTMLSpanElement>(null);
  const copyRef = useRef<HTMLSpanElement>(null);
  const linkRef = useRef<HTMLSpanElement>(null);
  const displayText = ens || Truncate(address, truncateLength, "middle");
  const chainId = useChainId();

  // will have to be adapted when we'll be able to display multiple chains
  const explorerName = chainId === 421614 ? "Arbiscan" : "Etherscan";

  useEffect(() => {
    if (
      (showAddressTooltip && spanRef.current) ||
      (showCopyTooltip && copyRef.current) ||
      (showLinkTooltip && linkRef.current)
    ) {
      const ref = showAddressTooltip ? spanRef : showCopyTooltip ? copyRef : linkRef;
      const rect = ref.current!.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top - 30,
        left: rect.left + rect.width / 2,
      });
    }
  }, [showAddressTooltip, showCopyTooltip, showLinkTooltip]);

  const renderTooltip = (content: string) =>
    createPortal(
      <div
        className="fixed z-50 px-2 py-1 bg-gray-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap transform -translate-x-1/2"
        style={{ top: `${tooltipPosition.top}px`, left: `${tooltipPosition.left}px` }}
      >
        {content}
      </div>,
      document.body,
    );

  return (
    <span className="inline-flex items-center gap-1">
      <span
        ref={spanRef}
        className="border-b border-dotted border-gray-400 cursor-pointer"
        onMouseEnter={() => setShowAddressTooltip(true)}
        onMouseLeave={() => setShowAddressTooltip(false)}
      >
        {displayText}
      </span>
      <span ref={copyRef} onMouseEnter={() => setShowCopyTooltip(true)} onMouseLeave={() => setShowCopyTooltip(false)}>
        {address && <CopyAndPaste value={address.toString()} />}
      </span>
      <span ref={linkRef} onMouseEnter={() => setShowLinkTooltip(true)} onMouseLeave={() => setShowLinkTooltip(false)}>
        <URI value={getExplorerUrl({ chainId, type: "address", hash: address })} />
      </span>
      {showAddressTooltip && renderTooltip(address as string)}
      {showCopyTooltip && renderTooltip("Copy address")}
      {showLinkTooltip && renderTooltip(`View on ${explorerName}`)}
    </span>
  );
};

export default Address;

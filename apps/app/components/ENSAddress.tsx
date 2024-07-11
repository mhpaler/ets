import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Truncate } from "@app/components/Truncate";
import { Hex } from "viem";

interface ENSAddressProps {
  address?: string | Hex;
  ens?: string | null;
  truncateLength?: number;
}

const ENSAddress: React.FC<ENSAddressProps> = ({ address, ens, truncateLength = 14 }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const spanRef = useRef<HTMLSpanElement>(null);
  const displayText = ens || Truncate(address, truncateLength, "middle");

  useEffect(() => {
    if (showTooltip && spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top - 30,
        left: rect.left + rect.width / 2,
      });
    }
  }, [showTooltip]);

  return (
    <>
      <span
        ref={spanRef}
        className="border-b border-dotted border-gray-400 cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {displayText}
      </span>
      {showTooltip &&
        createPortal(
          <div
            className="fixed z-50 px-2 py-1 bg-gray-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap transform -translate-x-1/2"
            style={{ top: `${tooltipPosition.top}px`, left: `${tooltipPosition.left}px` }}
          >
            {address}
          </div>,
          document.body,
        )}
    </>
  );
};

export default ENSAddress;

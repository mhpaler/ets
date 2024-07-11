import React from "react";
import { Truncate } from "@app/components/Truncate";
import { Hex } from "viem";

interface ENSAddressProps {
  address?: string | Hex;
  ens?: string | null;
  truncateLength?: number;
}

const ENSAddress: React.FC<ENSAddressProps> = ({ address, ens, truncateLength = 14 }) => {
  const displayText = ens || Truncate(address, truncateLength, "middle");

  return (
    <span className="group relative inline-block">
      <span className="ens-address border-b border-dotted border-gray-400 cursor-help">{displayText}</span>
      <span className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        {address}
      </span>
    </span>
  );
};

export default ENSAddress;

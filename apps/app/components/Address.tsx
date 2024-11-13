import { CopyAndPaste } from "@app/components/CopyAndPaste";
import { Truncate } from "@app/components/Truncate";
import { useExplorerUrl } from "@app/hooks/useExplorerUrl";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link.js";
import type React from "react";
import type { Hex } from "viem";
import { URI } from "./URI";

interface AddressProps {
  address?: string | Hex;
  addressType?: "evm" | "long-id" | "url";
  ens?: string | null;
  hoverText?: boolean;
  href?: string;
  copy?: boolean;
  explorerLink?: boolean;
}

/**
 * Address component displays Ethereum addresses with optional ENS names, copy functionality,
 * and blockchain explorer links.
 *
 * @component
 * @param {string | Hex} address - Ethereum address to display
 * @param {string} addressType - Type of address (default: "evm")
 * @param {string | null} ens - ENS name if available
 * @param {boolean} hoverText - Show hover text on hover (default: true)
 * @param {string} href - Optional link destination for the address
 * @param {boolean} copy - Show copy button (default: true)
 * @param {boolean} explorerLink - Show explorer link (default: true)
 *
 * @example
 * * Basic usage with all features
 * <Address address="0x123...abc" ens="vitalik.eth" />
 *
 * @example
 * * As a clickable link to a profile page
 * <Address
 *   address="0x123...abc"
 *   ens="vitalik.eth"
 *   href="/profile/0x123...abc"
 * />
 *
 * @example
 * * Minimal display without copy or explorer link
 * <Address
 *   address="0x123...abc"
 *   copy={false}
 *   explorerLink={false}
 * />
 *
 * @example
 * * Custom truncation length
 * <Address
 *   address="0x123...abc"
 * />
 */
const Address: React.FC<AddressProps> = ({
  address,
  addressType = "evm",
  ens,
  hoverText = true,
  href,
  copy = true,
  explorerLink = true,
}) => {
  const { t } = useTranslation("common");
  const getExplorerUrl = useExplorerUrl();
  const tooltipClass = addressType === "evm" ? "auto-tooltip-width" : "fixed-tooltip-width";
  let truncateLength = 14; // default for EVM addresses
  if (addressType === "url") {
    truncateLength = 32;
  } else if (addressType === "long-id") {
    truncateLength = 18;
  }
  const displayText = ens || Truncate(address, truncateLength, addressType === "evm" ? "middle" : "end");
  const addressDisplay = hoverText ? (
    <div className={tooltipClass}>
      <span className="lg:tooltip lg:tooltip-primary whitespace-normal break-words" data-tip={address}>
        {displayText}
      </span>
    </div>
  ) : (
    <span>displayText</span>
  );

  return (
    <span className="inline-flex items-center gap-1">
      {href ? (
        <Link
          onClick={(e) => {
            e.stopPropagation();
          }}
          href={href}
          className="link link-primary"
        >
          {addressDisplay}
        </Link>
      ) : (
        addressDisplay
      )}
      {address && copy && <CopyAndPaste value={address.toString()} />}
      {explorerLink && <URI value={getExplorerUrl("address", address)} hoverText={t("view-on-explorer")} />}
    </span>
  );
};

export default Address;

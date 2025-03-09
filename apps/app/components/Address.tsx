import { CopyAndPaste } from "@app/components/CopyAndPaste";
import { Truncate } from "@app/components/Truncate";
import { useExplorerUrl } from "@app/hooks/useExplorerUrl";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link.js";
import { useMemo } from "react";
import { memo } from "react";
import type { Hex } from "viem";
import { URI } from "./URI";

interface AddressProps {
  address?: string | Hex;
  type?: "address" | "nft" | "txn" | "url";
  ens?: string | null;
  hoverText?: boolean;
  href?: string;
  copy?: boolean;
  explorerLink?: boolean;
}

const Address: React.FC<AddressProps> = ({
  address,
  type = "address",
  ens,
  hoverText = true,
  href,
  copy = true,
  explorerLink = true,
}) => {
  const { t } = useTranslation("common");
  const { getNftUrl, getAddressUrl, getTxnUrl } = useExplorerUrl();

  const displayText = useMemo(
    () =>
      ens || Truncate(address, type === "url" ? 32 : type === "nft" ? 18 : 14, type === "address" ? "middle" : "end"),
    [address, ens, type],
  );

  const addressDisplay = hoverText ? (
    <div className="fixed-tooltip-width">
      <span className="lg:tooltip lg:tooltip-primary whitespace-normal break-words" data-tip={address}>
        {displayText}
      </span>
    </div>
  ) : (
    <span>{displayText}</span>
  );

  return (
    <span className="inline-flex items-center gap-1">
      {type === "url" ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="link link-primary">
          {addressDisplay}
        </a>
      ) : href ? (
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
      {explorerLink && (
        <URI
          value={type === "nft" ? getNftUrl(address) : type === "txn" ? getTxnUrl(address) : getAddressUrl(address)}
          hoverText={t("view-on-explorer")}
        />
      )}
    </span>
  );
};

export default memo(Address);

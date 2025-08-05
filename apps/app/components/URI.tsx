import { URIIcon } from "@app/components/icons";
import Link from "next/link.js";
import useTranslation from "next-translate/useTranslation";
import type React from "react";

interface URIProps {
  value: string;
  className?: string;
  hoverText?: string;
}

export const URI: React.FC<URIProps> = ({ value, className = "link link-primary", hoverText }) => {
  const { t } = useTranslation("common");

  const linkContent = (
    <>
      <URIIcon />
      <span className="sr-only">{t("Open URI")}</span>
    </>
  );

  return hoverText ? (
    <div className="lg:tooltip lg:tooltip-primary" data-tip={hoverText}>
      <Link
        onClick={(e) => {
          e.stopPropagation();
        }}
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {linkContent}
      </Link>
    </div>
  ) : (
    <Link
      onClick={(e) => {
        e.stopPropagation();
      }}
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {linkContent}
    </Link>
  );
};

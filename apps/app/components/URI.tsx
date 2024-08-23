import { URIIcon } from "@app/components/icons";
import useTranslation from "next-translate/useTranslation";
import type React from "react";

interface URIProps {
  value: string;
  className?: string;
}

export const URI: React.FC<URIProps> = ({ value, className = "link link-primary" }) => {
  const { t } = useTranslation("common");

  const openURI = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    window.open(value, "_blank", "noopener,noreferrer");
  };

  return (
    <button onClick={openURI} className={className}>
      <URIIcon />
      <span className="sr-only">{t("Open URI")}</span>
    </button>
  );
};

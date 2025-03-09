import { useEnvironmentContext } from "@app/context/EnvironmentContext";
import { getChainInfo } from "@app/utils/getChainInfo";
import useTranslation from "next-translate/useTranslation";
import Image from "next/image";
import Link from "next/link.js";
import { useEffect, useState } from "react";

const SiteMessage: React.FC = () => {
  const { t } = useTranslation("common");
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const { network } = useEnvironmentContext(); // Use the useSystem hook to get the current network

  useEffect(() => {
    const siteMessageDismissed = localStorage.getItem("siteMessageDismissed");
    if (siteMessageDismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("siteMessageDismissed", "true");
  };

  if (!isVisible) return null;

  if (network === "none") {
    return null; // or return a default message
  }

  const { chainName, displayName, iconPath } = getChainInfo(network);

  return (
    <>
      <div role="alert" className="alert flex items-center justify-between">
        {/* Left Section with Icon and Text */}
        <div className="flex items-center">
          <Image src={iconPath} alt={`${chainName} icon`} width={24} height={24} className="mr-3" />
          <div>
            <h3 className="text-lg">
              Welcome to the <span className="font-semibold">ETS Explorer</span> on{" "}
              <span className="font-semibold">{displayName}</span>
            </h3>
            <div className="text-sm">{t("testnet-warning")}</div>
          </div>
        </div>

        {/* Right Section with Link and Button */}
        <div className="flex items-center space-x-4 ml-auto">
          <Link
            className="link-primary font-medium text-sm"
            target="_blank"
            href="https://ets.xyz/docs/roadmap"
            passHref
            rel="noreferrer"
          >
            Learn more
          </Link>
          <button className="btn btn-primary btn-outline btn-sm" onClick={handleDismiss}>
            Dismiss
          </button>
        </div>
      </div>
    </>
  );
};

export default SiteMessage;

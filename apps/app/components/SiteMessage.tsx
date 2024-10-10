import { getCurrentChain } from "@app/config/wagmiConfig";
import { getChainInfo } from "@app/utils/getChainInfo";
import useTranslation from "next-translate/useTranslation";
import Image from "next/image";
import Link from "next/link.js";
import { useEffect, useState } from "react";

const SiteMessage: React.FC = () => {
  const { t } = useTranslation("common");
  const [isVisible, setIsVisible] = useState<boolean>(true);

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

  const currentChain = getCurrentChain();
  const { chainName, iconPath } = getChainInfo(currentChain.name.toLowerCase());

  return (
    <>
      <div role="alert" className="alert flex items-center justify-between">
        {/* Left Section with Icon and Text */}
        <div className="flex items-center">
          <Image src={iconPath} alt={`${chainName} icon`} width={24} height={24} className="mr-3" />
          <div>
            <h3 className="text-lg">
              Welcome to <span className="font-bold">ETS</span> on{" "}
              <span className="font-bold">{currentChain.name}</span>
            </h3>
            <div className="text-sm">{t("testnet-warning")}</div>
          </div>
        </div>

        {/* Right Section with Link and Button */}
        <div className="flex items-center space-x-4 ml-auto">
          <Link className="link-primary font-medium text-sm" href="/about" passHref>
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

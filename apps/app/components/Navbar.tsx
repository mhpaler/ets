import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import Breadcrumbs from "nextjs-breadcrumbs2";
import { BreadcrumbItem } from "./BreadcrumbItem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { t } = useTranslation("common");
  const { address, isConnected } = useAccount();

  const [clientClassName, setClientClassName] = useState("");
  useEffect(() => {
    // Apply dynamic class on the client side
    setClientClassName(`${address && isConnected ? "connected" : ""} connect-btn`);
  }, [address, isConnected]);

  return (
    <header className="px-4">
      <nav className="max-w-7xl mx-auto" aria-label="Top">
        <div className="flex items-center justify-between w-full py-5 border-b border-slate-100 lg:border-none">
          <div className="flex items-center">
            <Link href="/" passHref>
              <div className="relative flex items-center">
                <svg className="h-8 text-slate-800" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                  <path
                    fill="currentColor"
                    d="M0 50 50 0H0v50zm100 50V50l-50 50h50zM50 0l50 50V0H50zM19.9 84.9c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5 5 2.3 5 5z"
                  />
                </svg>
                <span className="xl:hidden ml-2.5 text-2xl font-medium text-slate-900">ETS</span>
                <span className="hidden xl:inline-flex ml-2.5 text-xl font-medium text-slate-900">
                  Ethereum Tag Service
                </span>
                <h1 className="sr-only">Ethereum Tag Service</h1>
              </div>
            </Link>
          </div>
          <div>
            <div className="flex items-center ml-4">
              <div className="flex mr-6 space-x-6">
                <Link
                  href="/relayers"
                  className="text-base font-medium text-pink-600 whitespace-nowrap hover:text-pink-700"
                  legacyBehavior
                >
                  {t("relayers")}
                </Link>
                <Link
                  href="/auction"
                  className="text-base font-medium text-pink-600 whitespace-nowrap hover:text-pink-700"
                >
                  {t("auction")}
                </Link>

                <Link
                  href="/playground"
                  className="text-base font-medium text-pink-600 whitespace-nowrap hover:text-pink-700"
                >
                  {t("playground")}
                </Link>
              </div>
              <span className={clientClassName}>
                <ConnectButton label="Connect" chainStatus="name" showBalance={false} accountStatus="address" />
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center py-4 space-x-8 lg:hidden">
          <Link href="/relayers" className="text-base font-medium text-pink-600 whitespace-nowrap hover:text-pink-700">
            {t("relayers")}
          </Link>

          <Link href="/auctions" className="text-base font-medium text-pink-600 whitespace-nowrap hover:text-pink-700">
            {t("auctions")}
          </Link>

          <Link
            href="/playground"
            className="text-base font-medium text-pink-600 whitespace-nowrap hover:text-pink-700"
          >
            {t("playground")}
          </Link>
        </div>
        <div className="hidden md:block">
          <Breadcrumbs
            rootLabel="Home"
            transformLabel={(title) => {
              return <BreadcrumbItem title={title} />;
            }}
            inactiveItemClassName={"text-sm font-medium text-gray-500 hover:text-pink-700 capitalize"}
            activeItemClassName={"text-sm font-medium text-gray-400 pointer-events-none capitalize"}
            listClassName={"flex items-center space-x-2 truncate"}
            useDefaultStyle={false}
          />
        </div>
      </nav>
    </header>
  );
}

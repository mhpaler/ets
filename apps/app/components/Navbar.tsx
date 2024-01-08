import { useRouter } from "next/router";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import Breadcrumbs from "nextjs-breadcrumbs2";
import { BreadcrumbItem } from "./BreadcrumbItem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  const { t } = useTranslation("common");
  const router = useRouter();

  const isActive = (basePath: string): boolean => {
    const firstSegment = router.pathname.split("/")[1];
    return firstSegment === basePath;
  };

  return (
    <div className="flex-grow px-4">
      <header className="max-w-7xl mx-auto">
        <div className="navbar bg-base-100">
          <div className="navbar-start">
            <div className="dropdown">
              <div tabIndex={0} role="button" className="btn btn-square btn-ghost md:hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block w-5 h-5 stroke-current"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <Link href="/auction">{t("auction")}</Link>
                </li>
                <li>
                  <Link href="/relayers">{t("relayers")}</Link>
                </li>
                <li>
                  <Link href="/playground">{t("playground")}</Link>
                </li>
              </ul>
            </div>
            <Link href="/" passHref>
              <div className="relative flex items-center">
                <svg
                  className="h-8 text-slate-800 hidden md:block"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                >
                  <path
                    fill="currentColor"
                    d="M0 50 50 0H0v50zm100 50V50l-50 50h50zM50 0l50 50V0H50zM19.9 84.9c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5 5 2.3 5 5z"
                  />
                </svg>
                <span className="xl:hidden ml-2.5 text-2xl font-bold md:font-medium text-slate-900">ETS</span>
                <span className="hidden xl:inline-flex ml-2.5 text-xl font-medium text-slate-900">
                  Ethereum Tag Service
                </span>
                <h1 className="sr-only">Ethereum Tag Service</h1>
              </div>
            </Link>
          </div>
          <div className="navbar-center hidden md:flex">
            <ul className="menu menu-horizontal px-1">
              <li>
                <Link className={isActive("auction") ? "bg-gray-200" : ""} href="/auction">
                  {t("auction")}
                </Link>
              </li>
              <li>
                <Link className={isActive("relayers") ? "bg-gray-200" : ""} href="/relayers">
                  {t("relayers")}
                </Link>
              </li>
              <li>
                <Link className={isActive("playground") ? "bg-gray-200" : ""} href="/playground">
                  {t("playground")}
                </Link>
              </li>
            </ul>
          </div>
          <div className="navbar-end">
            <span className="connect-btn">
              <ConnectButton label="Connect" showBalance={false} accountStatus="address" />
            </span>
          </div>
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
      </header>
    </div>
  );
}

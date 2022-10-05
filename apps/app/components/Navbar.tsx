import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import Breadcrumbs from "nextjs-breadcrumbs";
import { BreadcrumbItem } from "./BreadcrumbItem";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  const { t } = useTranslation("common");

  return (
    <header className="px-4">
      <div className="relative bg-pink-500 -mx-4">
        <div className="mx-auto max-w-7xl py-3 px-3 sm:px-6 lg:px-8">
          <div className="pr-16 sm:px-16 sm:text-center">
            <p className="font-medium text-white">
              <span className="hidden md:inline">
                ETS is alpha software running on Polygon Mumbai Testnet
                &nbsp;•&nbsp;&nbsp;
                <a
                  className="underline"
                  href="https://github.com/ethereum-tag-service/ets#readme"
                  target={"blank"}
                >
                  Learn more
                </a>
              </span>
            </p>
          </div>
        </div>
      </div>
      <nav className="max-w-6xl mx-auto" aria-label="Top">
        <div className="flex items-center justify-between w-full py-5 border-b border-slate-100 lg:border-none">
          <div className="flex items-center">
            <Link href="/">
              <a>
                {/* <svg fill="currentColor" className="h-8 text-slate-800" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 294 100">
                  <path d="M129.1 16.2h45.7v10.3h-34v17.3h33.3v10.3h-33.3v18.5h34v10.3h-45.7V16.2zm73.6 10.3h-20.2V16.2h52.1v10.3h-20.2v56.4h-11.7V26.5zm43.5 38c4.6 4.9 11.8 9.2 21.1 9.2 9.6 0 13.4-4.7 13.4-9.1 0-6-7.1-7.8-15.2-9.9-10.9-2.7-23.7-5.9-23.7-20 0-11 9.7-19.5 24.3-19.5 10.4 0 18.8 3.3 25 9.3l-6.7 8.7c-5.2-5.2-12.3-7.6-19.3-7.6-6.9 0-11.3 3.3-11.3 8.3 0 5.2 6.8 6.9 14.7 8.9 11 2.8 24.1 6.2 24.1 20.7 0 11.1-7.8 20.6-25.8 20.6-12.3 0-21.2-4.3-27.1-10.6l6.5-9zM0 49.7l50-50H0v50zm100 50v-50l-50 50h50zM50-.3l50 50v-50H50z" />
                  <circle cx="14.9" cy="84.7" r="5" />
                </svg> */}
                <div className="relative flex items-center">
                  <svg
                    className="h-8 text-slate-800"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 100"
                  >
                    <path
                      fill="currentColor"
                      d="M0 50 50 0H0v50zm100 50V50l-50 50h50zM50 0l50 50V0H50zM19.9 84.9c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5 5 2.3 5 5z"
                    />
                  </svg>
                  {/* <svg className="h-8 text-slate-800" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    <rect className="animate-ets-outer" fill="currentColor" mask="url(#mask)" x="0" y="0" width="100" height="100" />
                    <mask id="mask">
                      <rect fill="white" x="0" y="0" width="100" height="100" />
                      <rect className="animate-ets-inner" fill="black" x="15" y="15" width="70" height="70" transform="rotate(45 50 50)" />
                    </mask>
                    <circle className="dot" fill="currentColor" cx="15" cy="85" r="5"/>
                  </svg> */}
                  <span className="xl:hidden ml-2.5 text-2xl font-medium text-slate-900">
                    ETS
                  </span>
                  <span className="hidden xl:inline-flex ml-2.5 text-xl font-medium text-slate-900">
                    Ethereum Tag Service
                  </span>
                </div>
                <h1 className="sr-only">Ethereum Tag Service</h1>
              </a>
            </Link>
          </div>
          <div>
            <div className="flex items-center ml-4">
              <div className="flex mr-6 space-x-6">
                <Link href="/publishers">
                  <a className="text-base font-medium text-pink-600 whitespace-nowrap hover:text-pink-700">
                    {t("publishers")}
                  </a>
                </Link>
                {/**
                <Link href="/auctions">
                  <a className="text-base font-medium text-pink-600 whitespace-nowrap hover:text-pink-700">
                    {t("auctions")}
                  </a>
                </Link>

                <Link href="/playground">
                  <a className="text-base font-medium text-pink-600 whitespace-nowrap hover:text-pink-700">
                    {t("playground")}
                  </a>
                </Link>
                 */}
              </div>

              <ConnectButton />
            </div>
          </div>
        </div>
        {/** 
        <div className="flex flex-wrap justify-center py-4 space-x-8 lg:hidden">
          <Link href="/publishers">
            <a className="text-base font-medium text-pink-600 whitespace-nowrap hover:text-pink-700">
              {t("publishers")}
            </a>
          </Link>
          
          <Link href="/auctions">
            <a className="text-base font-medium text-pink-600 whitespace-nowrap hover:text-pink-700">
              {t("auctions")}
            </a>
          </Link>

          <Link href="/playground">
            <a className="text-base font-medium text-pink-600 whitespace-nowrap hover:text-pink-700">
              {t("playground")}
            </a>
          </Link>
          
        </div>
        */}
        <div className="hidden md:block">
          <Breadcrumbs
            rootLabel="Home"
            transformLabel={(title) => {
              return <BreadcrumbItem title={title} />;
            }}
            inactiveItemClassName={
              "text-sm font-medium text-gray-500 hover:text-pink-700 capitalize"
            }
            activeItemClassName={
              "text-sm font-medium text-gray-400 pointer-events-none capitalize"
            }
            listClassName={"flex items-center space-x-2"}
            useDefaultStyle={false}
          />
        </div>
      </nav>
    </header>
  );
}

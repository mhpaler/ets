import { useRouter } from "next/router";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";

import { AuctionIcon } from "./icons/AuctionIcon";
import { Globe } from "./icons/Globe";
import { Playground } from "./icons/Playground";

export default function Navigation() {
  const { t } = useTranslation("common");
  const router = useRouter();

  const isActive = (basePath: string): boolean => {
    const firstSegment = router.pathname.split("/")[1];
    return firstSegment === basePath;
  };
  return (
    <>
      <nav className="flex min-h-screen w-80 flex-col gap-2 overflow-y-auto bg-base-100 px-6 py-10">
        <div className="mr-0 ml-4 items-center font-black mb-4">
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
              <span className="hidden md:inline-flex ml-2.5 text-xl font-medium text-slate-900 tracking-tight">
                Ethereum Tag Service
              </span>
              <h1 className="sr-only">Ethereum Tag Service</h1>
            </div>
          </Link>
        </div>
        <ul className="menu font-normal text-gray-400">
          <li>
            <Link className={isActive("") ? "text-gray-950 bg-gray-100" : ""} href="/">
              <span className="-mr-1.5">
                <Globe size={24} />
              </span>
              {t("explorer")}
            </Link>
            <ul>
              <li>
                <Link className={isActive("tagging-records") ? "text-gray-950 bg-gray-50" : ""} href="/tagging-records">
                  {t("tagging-records")}
                </Link>
              </li>
              <li>
                <Link className={isActive("tags") ? "text-gray-950 bg-gray-50" : ""} href="/tags">
                  {t("tags")}
                </Link>
              </li>
              <li>
                <Link className={isActive("targets") ? "text-gray-950 bg-gray-50" : ""} href="/targets">
                  {t("targets")}
                </Link>
              </li>
              <li>
                <Link className={isActive("relayers") ? "text-gray-950 bg-gray-50" : ""} href="/relayers">
                  {t("relayers")}
                </Link>
              </li>
              <li>
                <Link className={isActive("taggers") ? "text-gray-950 bg-gray-50" : ""} href="/taggers">
                  {t("taggers")}
                </Link>
              </li>
              <li>
                <Link className={isActive("creators") ? "text-gray-950 bg-gray-50" : ""} href="/creators">
                  {t("tag-creators")}
                </Link>
              </li>
              <li>
                <Link className={isActive("owners") ? "text-gray-950 bg-gray-50" : ""} href="/owners">
                  {t("tag-owners")}
                </Link>
              </li>
            </ul>
          </li>

          <li>
            <Link className={isActive("auction") ? "text-gray-950 bg-gray-50" : ""} href="/auction">
              <span className="-mr-1.5">
                <AuctionIcon size={24} />
              </span>
              {t("auction")}
            </Link>
          </li>

          <li>
            <Link className={isActive("playground") ? "text-gray-950 bg-gray-50" : ""} href="/playground">
              <span className="-mr-1.5">
                <Playground size={24} />
              </span>
              {t("playground")}
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}

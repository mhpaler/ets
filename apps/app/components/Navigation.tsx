import { AuctionIcon, Globe, Playground, Relayer, Tag, TaggingRecord, Target } from "@app/components/icons";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Navigation() {
  const { t } = useTranslation("common");
  const router = useRouter();

  const isActive = (basePath: string): boolean => {
    const pathSegments = router.pathname.split("/").filter(Boolean);
    return pathSegments.includes(basePath);
  };

  return (
    <>
      <nav className="flex min-h-screen w-80 flex-col gap-2 overflow-y-auto bg-base-100 px-6 py-5">
        <div className="mr-0 ml-0 items-center font-black mb-4">
          <Link href="/" passHref>
            <div className="relative flex items-center">
              <svg
                className="h-8 text-slate-800 hidden md:block"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
              >
                <title>ETS Logo</title>
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
        <ul className="menu font-medium text-slate-600 ml-0 pl-0 [&_a:hover]:text-slate-900">
          <li>
            <Link className={isActive("explore") ? "text-slate-950 bg-slate-100" : ""} href="/explore">
              <span className="-mr-1.5">
                <Globe size={24} />
              </span>
              {t("explore")}
            </Link>
            <ul>
              <li>
                <Link
                  className={isActive("tagging-records") ? "text-gray-950 bg-slate-100" : ""}
                  href="/explore/tagging-records"
                >
                  <span className="-mr-1.5">
                    <TaggingRecord size={24} />
                  </span>
                  {t("tagging-records")}
                </Link>
              </li>
              <li>
                <Link className={isActive("tags") ? "text-gray-950 bg-slate-100" : ""} href="/explore/tags">
                  <span className="-mr-1.5">
                    <Tag size={24} />
                  </span>
                  {t("tags")}
                </Link>
              </li>
              <li>
                <Link className={isActive("targets") ? "text-gray-950 bg-slate-100" : ""} href="/explore/targets">
                  <span className="-mr-1.5">
                    <Target size={24} />
                  </span>
                  {t("targets")}
                </Link>
              </li>
              <li>
                <Link className={isActive("relayers") ? "text-gray-950 bg-slate-100" : ""} href="/explore/relayers">
                  <span className="-mr-1.5">
                    <Relayer size={24} />
                  </span>
                  {t("relayers")}
                </Link>
              </li>
              <li>
                <Link className={isActive("taggers") ? "text-gray-950 bg-slate-100" : ""} href="/explore/taggers">
                  {t("taggers")}
                </Link>
              </li>
              <li>
                <Link className={isActive("creators") ? "text-gray-950 bg-slate-100" : ""} href="/explore/creators">
                  {t("tag-creators")}
                </Link>
              </li>
              <li>
                <Link className={isActive("owners") ? "text-gray-950 bg-slate-100" : ""} href="/explore/owners">
                  {t("tag-owners")}
                </Link>
              </li>
            </ul>
          </li>

          <li>
            <Link className={isActive("auction") ? "text-gray-950 bg-slate-100" : ""} href="/auction">
              <span className="-mr-1.5">
                <AuctionIcon size={24} />
              </span>
              {t("auction")}
            </Link>
          </li>

          <li>
            <Link className={isActive("playground") ? "text-gray-950 bg-slate-100" : ""} href="/playground">
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

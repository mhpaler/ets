import { useRouter } from "next/router";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";

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
        <div className="mx-4 flex items-center gap-2 font-black mb-4">
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
              <span className="hidden md:inline-flex ml-2.5 text-xl font-medium text-slate-900">
                Ethereum Tag Service
              </span>
              <h1 className="sr-only">Ethereum Tag Service</h1>
            </div>
          </Link>
        </div>
        <ul className="menu">
          <li>
            <Link className={isActive("") ? "bg-base-200" : ""} href="/">
              {t("dashboard")}
            </Link>
          </li>

          <li>
            <h2>Explorer</h2>
            <ul>
              <li>
                <Link className={isActive("tagging-records") ? "bg-base-200" : ""} href="/tagging-records">
                  {t("tagging-records")}
                </Link>
              </li>
              <li>
                <Link className={isActive("tags") ? "bg-base-200" : ""} href="/tags">
                  {t("tags")}
                </Link>
              </li>
              <li>
                <Link className={isActive("targets") ? "bg-base-200" : ""} href="/targets">
                  {t("targets")}
                </Link>
              </li>
              <li>
                <Link className={isActive("relayers") ? "bg-slate-100" : ""} href="/relayers">
                  {t("relayers")}
                </Link>
              </li>
              <li>
                <Link className={isActive("taggers") ? "bg-base-200" : ""} href="/taggers">
                  {t("taggers")}
                </Link>
              </li>
              <li>
                <Link className={isActive("creators") ? "bg-base-200" : ""} href="/creators">
                  {t("tag-creators")}
                </Link>
              </li>
              <li>
                <Link className={isActive("owners") ? "bg-base-200" : ""} href="/owners">
                  {t("tag-owners")}
                </Link>
              </li>
            </ul>
          </li>

          <li>
            <summary>Auction</summary>
            <ul>
              <li>
                <a>Active</a>
              </li>

              <li>
                <a>Upcoming</a>
              </li>
            </ul>
          </li>

          <li>
            <summary>Playground</summary>
            <ul>
              <li>
                <Link className={isActive("create-tag") ? "bg-base-200" : ""} href="/playground/create-tag">
                  {t("create-tag")}
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </>
  );
}

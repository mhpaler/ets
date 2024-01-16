import { useRouter } from "next/router";
import Head from "next/head";

import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import Breadcrumbs from "nextjs-breadcrumbs2";
import { BreadcrumbItem } from "./BreadcrumbItem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import PageTitle from "@app/components/PageTitle";
import { Truncate } from "@app/components/Truncate";

export default function Header() {
  const { t } = useTranslation("common");
  const router = useRouter();

  const getTranslatedPath = (): string => {
    const pathSegments = router.pathname.split("/").slice(1);
    return pathSegments
      .map((segment, index, segments) => {
        // Check if the segment is a dynamic route parameter
        if (segment.startsWith("[") && segment.endsWith("]")) {
          // Extract the actual parameter name
          const paramName = segment.slice(1, -1);
          // Use the value from the router query, if available
          const value = router.query[paramName];

          if (index === 1 && segments[0] === "tags" && value) {
            // If the first segment is "tags" and there is a dynamic argument, append "#" to it
            return `#${Truncate(value)}`;
          } else {
            return Truncate(value);
          }
        }

        // Check if there is a dynamic segment following this regular segment
        //if (index < segments.length - 1 && segments[index + 1].startsWith("[") && segments[index + 1].endsWith("]")) {
        //  // If the regular segment ends with "s", strip it before translation
        //  if (segment.endsWith("s")) {
        //    segment = segment.slice(0, -1);
        //  }
        //}

        // For regular segments, use the translation function
        return t(segment);
      })
      .join(": ");
  };

  return (
    <>
      <Head>
        <title>{getTranslatedPath()}</title>
      </Head>
      <header className="col-span-12 flex items-center gap-2 lg:gap-4">
        <label htmlFor="main-drawer" className="btn btn-square btn-ghost drawer-button lg:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-5 h-5 stroke-current"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </label>
        <Link href="/" passHref className="lg:hidden">
          <div className="relative flex items-center">
            <span className="ml-2.5 text-xl font-bold text-slate-900">ETS</span>
            <h1 className="sr-only">Ethereum Tag Service</h1>
          </div>
        </Link>
        <div className="grow">
          <h1 className="lg:text-xl font-medium hidden lg:block">{getTranslatedPath() || t("Dashboard")}</h1>
        </div>
        <div>
          <input type="text" placeholder="Search (todo)" className="input input-sm max-sm:w-24" />
        </div>
        <span className="connect-btn">
          <ConnectButton label="Connect" showBalance={false} accountStatus="address" />
        </span>
      </header>

      <PageTitle title={getTranslatedPath() || t("Dashboard")} />

      <div className="col-span-12 hidden lg:block">
        <Breadcrumbs
          rootLabel="Home"
          transformLabel={(title) => {
            return <BreadcrumbItem title={Truncate(title)} />;
          }}
          inactiveItemClassName={"text-sm font-medium link-primary capitalize"}
          activeItemClassName={"text-sm font-medium opacity-50 pointer-events-none"}
          listClassName={"flex items-center space-x-2 truncate"}
          useDefaultStyle={false}
        />
      </div>
    </>
  );
}

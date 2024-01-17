import Head from "next/head";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import Breadcrumbs from "nextjs-breadcrumbs2";
import { BreadcrumbItem } from "./BreadcrumbItem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { pathToTitle } from "@app/utils/titleUtils";
import PageTitle from "@app/components/PageTitle";
import { Truncate } from "@app/components/Truncate";

export default function Header() {
  const { t } = useTranslation("common");
  const title = pathToTitle();

  return (
    <>
      <Head>
        <title>title</title>
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
          <h1 className="lg:text-xl font-medium hidden lg:block">{title}</h1>
        </div>
        <div>
          <input type="text" placeholder="Search (todo)" className="input input-sm max-sm:w-24" />
        </div>
        <span className="connect-btn">
          <ConnectButton label="Connect" showBalance={false} accountStatus="address" />
        </span>
      </header>

      <PageTitle title={title} />
      <div className="col-span-12 hidden lg:block">
        <Breadcrumbs
          rootLabel={t("dashboard")}
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

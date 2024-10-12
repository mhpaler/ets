import ChainModalETS from "@app/components/ChainModalETS";
import SiteMessage from "@app/components/SiteMessage";
import { Stats } from "@app/components/Stats";
import { TaggingRecords } from "@app/components/TaggingRecords";
import { getCurrentChain } from "@app/config/wagmiConfig";
import Layout from "@app/layouts/default";
import { getChainInfo } from "@app/utils/getChainInfo";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";

import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const { t } = useTranslation("common");
  const [showIndexPage, setShowIndexPage] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === "localhost";
    const isStage = hostname === "stage.app.ets.xyz";
    const isMain = hostname === "app.ets.xyz";

    const parts = hostname.split(".");
    const subdomain = parts.length > 2 ? parts[0].toLowerCase() : null;

    // Show index page only for root domains in localhost, stage, and main (not for specific chain subdomains)
    if ((isLocalhost || isStage || isMain) && !subdomain) {
      setShowIndexPage(true);
    }
  }, []);

  if (showIndexPage) {
    // Render index page with links to chain subdomains
    return (
      <div className="flex items-center justify-center h-screen px-6">
        <main className="max-w-sm py-6 my-auto space-y-6">
          <div className="flex items-center justify-center mt-10 mb-14">
            <svg className="w-8 h-8 text-slate-800" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
              <title>ETS Logo</title>
              <path
                fill="currentColor"
                d="M0 50 50 0H0v50zm100 50V50l-50 50h50zM50 0l50 50V0H50zM19.9 84.9c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5 5 2.3 5 5z"
              />
            </svg>
            <span className="inline-flex ml-2.5 text-xl font-medium text-slate-900">Ethereum Tag Service</span>
          </div>

          <ChainModalETS show={true} onClose={() => {}} asModal={false} />
        </main>
      </div>
    );
  }

  return (
    <Layout>
      <div className="mb-4 col-span-12">
        <SiteMessage />
      </div>
      <Stats />
      <TaggingRecords title={t("latest-tagging-records")} />
    </Layout>
  );
};

export default Home;

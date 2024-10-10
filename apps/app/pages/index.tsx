import { Stats } from "@app/components/Stats";
import { TaggingRecords } from "@app/components/TaggingRecords";
import { getCurrentChain } from "@app/config/wagmiConfig";
import Layout from "@app/layouts/default";
import { getChainInfo } from "@app/utils/getChainInfo";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const { t } = useTranslation("common");
  const [showIndexPage, setShowIndexPage] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === "localhost";
    //const isPR = hostname.includes("-git-");
    const isStage = hostname.includes("stage.app.ets.xyz");
    const isMain = hostname === "app.ets.xyz";

    const parts = hostname.split(".");
    const subdomain = parts.length > 2 ? parts[0].toLowerCase() : null;

    // Show index page only for localhost, stage, and main (not for PR environments)
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
          <h1>Welcome to Ethereum Tag Service</h1>

          <p>Select a network:</p>
          <ul>
            <li>
              <Link className="link-primary" href="http://arbitrumsepolia.localhost:3000">
                Arbitrum Sepolia (Localhost)
              </Link>
            </li>
            <li>
              <Link className="link-primary" href="http://basesepolia.localhost:3000">
                Base Sepolia (Localhost)
              </Link>
            </li>
            <li>
              <Link className="link-primary" href="https://arbitrumsepolia.stage.app.ets.xyz">
                Arbitrum Sepolia (Staging)
              </Link>
            </li>
            <li>
              <Link className="link-primary" href="https://basesepolia.stage.app.ets.xyz">
                Base Sepolia (Staging)
              </Link>
            </li>
            <li>
              <Link className="link-primary" href="https://arbitrumsepolia.app.ets.xyz">
                Arbitrum Sepolia (Production)
              </Link>
            </li>
            <li>
              <Link className="link-primary" href="https://basesepolia.app.ets.xyz">
                Base Sepolia (Production)
              </Link>
            </li>
          </ul>
        </main>
      </div>
    );
  }

  // Default to a specific chain in PR environments or on specific subdomains
  const currentChain = getCurrentChain();
  const { chainName } = getChainInfo();

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Welcome to {currentChain.name}</h1>
        <p>You are currently on the {chainName} network.</p>
      </div>
      <Stats />
      <TaggingRecords title={t("latest-tagging-records")} />
    </Layout>
  );
};

export default Home;

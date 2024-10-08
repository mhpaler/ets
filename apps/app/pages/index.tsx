import { Stats } from "@app/components/Stats";
import { TaggingRecords } from "@app/components/TaggingRecords";
import { getCurrentChain } from "@app/config/wagmiConfig";
import Layout from "@app/layouts/default";
import { getChainInfo } from "@app/utils/getChainInfo";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Home: NextPage = () => {
  const router = useRouter();
  const currentChain = getCurrentChain();
  const { chainName } = getChainInfo();
  const { t } = useTranslation("common");

  useEffect(() => {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === "localhost";
    const parts = hostname.split(".");
    const subdomain = parts.length > 2 ? parts[1].toLowerCase() : parts[0].toLowerCase();

    if (isLocalhost && subdomain === "localhost") {
      // Render root page for localhost
      return;
    }

    if (!isLocalhost && !["arbitrumsepolia", "basesepolia"].includes(subdomain)) {
      router.push("https://app.ets.xyz");
    }
  }, [router]);

  if (typeof window !== "undefined" && window.location.hostname === "localhost" && window.location.port === "3000") {
    return (
      <Layout>
        <div className="bg-gray-100 p-4 rounded-lg mt-8 text-sm">
          <h1>Welcome to Ethereum Tag Service</h1>
          <p>Please select a network:</p>
          <ul>
            <li>
              <Link href="http://arbitrumsepolia.localhost:3000">Arbitrum Sepolia</Link>
            </li>
            <li>
              <Link href="http://basesepolia.localhost:3000">Base Sepolia</Link>
            </li>
            <li>
              <Link href="http://hardhat.localhost:3000">Hardhat (Local Development)</Link>
            </li>
          </ul>
        </div>
      </Layout>
    );
  }

  /*   if (chainName === "hardhat") {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h1 className="text-2xl font-bold mb-4">Ethereum Tag Service - Hardhat Development</h1>
            <p className="mb-6">You are currently on the Hardhat development network.</p>
          </div>
        </div>
      </Layout>
    );
  } */

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

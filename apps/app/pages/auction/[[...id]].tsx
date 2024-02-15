import type { NextPage } from "next";
import { useRouter } from "next/router";
import Layout from "@app/layouts/default";

import useTranslation from "next-translate/useTranslation";
import { AuctionHouseProvider } from "@app/context/AuctionHouseContext";
import { Auctions } from "@app/components/Auctions";
import AuctionWrapper from "@app/components/AuctionWrapper";

interface AuctionPageProps {
  initialAuctionId?: number;
}

const AuctionPage: NextPage<AuctionPageProps> = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { id } = router.query;
  const requestedAuctionId = Array.isArray(id) ? Number(id[0]) : Number(id) || null;

  return (
    <Layout>
      <AuctionHouseProvider requestedAuctionId={requestedAuctionId}>
        <AuctionWrapper />
      </AuctionHouseProvider>
    </Layout>
  );
};

export default AuctionPage;

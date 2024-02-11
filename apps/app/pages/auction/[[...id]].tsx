import type { NextPage } from "next";
import { useRouter } from "next/router";
import Layout from "@app/layouts/default";

import useTranslation from "next-translate/useTranslation";
import { AuctionHouseProvider } from "@app/context/AuctionHouseContext";
//import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import { Auctions } from "@app/components/Auctions";
import AuctionWrapper from "@app/components/AuctionWrapper";
import { FeaturedAuction } from "../../components/FeaturedAuction";

interface AuctionPageProps {
  initialAuctionId?: number;
}

const AuctionPage: NextPage<AuctionPageProps> = () => {
  const { t } = useTranslation("common");
  //  const auctionHouseContext = useAuctionHouse();
  //  if (!auctionHouseContext) return null;
  const router = useRouter();
  const { id } = router.query;
  const requestedAuctionId = Array.isArray(id) ? Number(id[0]) : null;

  return (
    <Layout>
      <AuctionHouseProvider requestedAuctionId={requestedAuctionId}>
        <AuctionWrapper />
      </AuctionHouseProvider>
      <Auctions />
    </Layout>
  );
};

export default AuctionPage;

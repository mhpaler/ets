import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { useAuctionHouse } from "../../hooks/useAuctionHouse";
import { Auctions } from "@app/components/Auctions";
import AuctionWrapper from "@app/components/AuctionWrapper";
import { FeaturedAuction } from "../../components/FeaturedAuction";
import PageTitle from "../../components/PageTitle";

interface AuctionPageProps {
  initialAuctionId?: number;
}

const AuctionPage: NextPage<AuctionPageProps> = () => {
  const { t } = useTranslation("common");
  const auctionHouseContext = useAuctionHouse();
  if (!auctionHouseContext) return null;

  const router = useRouter();
  const { id } = router.query;
  const initialAuctionId = Array.isArray(id) ? Number(id[0]) : undefined;
  const { currentAuctionId, maxAuctions } = auctionHouseContext;

  // Handle the case where initialAuctionId is undefined

  const pageTitle = `${t("CTAG Auction")}`;
  const browserTitle = `${pageTitle} | ETS`;

  return (
    <div className="max-w-7xl mx-auto mt-12">
      <Head>
        <title>{browserTitle}</title>
      </Head>
      <PageTitle title={pageTitle} />
      {
        <div className="max-w-7xl mx-auto mt-12">
          <div>
            Current Auction Id: <span>{currentAuctionId}</span>
          </div>
          <div>Max Auctions: {maxAuctions !== null ? maxAuctions : "N/A"}</div>
          <p>No auction ID specified.</p>
        </div>
      }
      <AuctionWrapper auctionId={initialAuctionId} />
      <Auctions />
    </div>
  );
};

export default AuctionPage;

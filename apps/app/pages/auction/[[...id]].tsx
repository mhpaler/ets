import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { AuctionHouseProvider } from "@app/context/AuctionHouseContext";

//import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import { Auctions } from "@app/components/Auctions";
import AuctionWrapper from "@app/components/AuctionWrapper";
import { FeaturedAuction } from "../../components/FeaturedAuction";
import PageTitle from "@app/components/PageTitle";

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
  //const { currentAuctionId, maxAuctions } = auctionHouseContext;

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
            Requested Auction Id: <span>{requestedAuctionId}</span>
          </div>
        </div>
      }
      <AuctionHouseProvider requestedAuctionId={requestedAuctionId}>
        <AuctionWrapper />
      </AuctionHouseProvider>
      <Auctions />
    </div>
  );
};

export default AuctionPage;

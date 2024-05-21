import type { NextPage } from "next";
import { useRouter } from "next/router";
import Layout from "@app/layouts/default";

// TODO: Move this provider to _app.tsx?
//import { AuctionHouseProvider } from "@app/context/AuctionHouseContext";
import { AuctionProvider } from "@app/context/AuctionContext";
import AuctionDisplay from "@app/components/auction/AuctionDisplay";

interface AuctionPageProps {
  initialAuctionId?: number;
}

const AuctionPage: NextPage<AuctionPageProps> = () => {
  const router = useRouter();
  const { auctionId } = router.query;

  return (
    <Layout>
      <AuctionProvider auctionId={Number(auctionId)}>
        <AuctionDisplay />
      </AuctionProvider>
    </Layout>
  );
};

export default AuctionPage;

import Layout from "@app/layouts/default";
import type { NextPage } from "next";
import { useRouter } from "next/router";

import AuctionDisplay from "@app/components/auction/AuctionDisplay";
import { AuctionProvider } from "@app/context/AuctionContext";

interface AuctionPageProps {
  initialAuctionId?: number;
}

const AuctionPage: NextPage<AuctionPageProps> = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout>
      <AuctionProvider auctionId={Number(id)}>
        <AuctionDisplay />
      </AuctionProvider>
    </Layout>
  );
};

export default AuctionPage;

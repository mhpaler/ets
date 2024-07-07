import type { NextPage } from "next";
import { useRouter } from "next/router";
import Layout from "@app/layouts/default";

import { AuctionProvider } from "@app/context/AuctionContext";
import AuctionDisplay from "@app/components/auction/AuctionDisplay";

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

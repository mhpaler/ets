import type { NextPage } from "next";
import { TagType } from "@app/types/tag";
import Layout from "@app/layouts/default";
import useTranslation from "next-translate/useTranslation";
import { useSystem } from "@app/hooks/useSystem";
import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import { useCtags } from "@app/hooks/useCtags";
import { toEth } from "@app/utils";
import { Truncate } from "@app/components/Truncate";
import { TimeAgo } from "@app/components/TimeAgo";
import { Tag } from "@app/components/Tag";
import { Tags } from "@app/components/Tags";
import AuctionActions from "@app/components/auction/AuctionActions";
import AuctionTimer from "@app/components/auction/AuctionTimer";

const Auction: NextPage = () => {
  const { t } = useTranslation("common");
  const { platformAddress } = useSystem();
  const { allAuctions } = useAuctionHouse();

  if (!allAuctions || allAuctions.length === 0) {
    return <Layout>Loading auctions...</Layout>; // Or some other loading/error handling
  }

  const activeAuctions = allAuctions
    .filter((auction) => auction.startTime === 0 || auction.settled === false)
    .sort((a, b) => b.id - a.id);

  return (
    <Layout>
      <Auctions
        listId="active"
        title={t("active")}
        auctions={activeAuctions}
        rowLink={true}
        columnsConfig={[
          {
            title: "#",
            field: "id",
          },
          {
            title: "tag",
            field: "tag",
            formatter: (tag, auction) => <Tag tag={tag} />,
          },
          {
            title: "current bid",
            field: "amount",
            formatter: (value, auction) => (auction.startTime === 0 ? "—" : `${toEth(value, 5)} ETH`),
          },
          {
            title: "bidder",
            field: "bidder.id",
            formatter: (value, auction) => (auction.startTime === 0 ? "—" : Truncate(value, 13, "middle")),
          },
          {
            title: "time left",
            field: "endTime",
            formatter: (value, auction) => <AuctionTimer auction={auction} />, // 'value' is 'auction.endTime'
          },
          {
            title: "",
            field: "id",
            formatter: (id, auction) => (
              <AuctionActions
                key={id + auction.ended}
                auction={auction}
                buttonClasses="btn-primary btn-outline btn-sm"
              />
            ),
          },
        ]}
      />
    </Layout>
  );
};

export default Auction;

import type { NextPage } from "next";
import Layout from "@app/layouts/default";
import useTranslation from "next-translate/useTranslation";
import { AuctionProvider } from "@app/context/AuctionContext";
import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import { Auctions } from "@app/components/Auctions";
// TODO: Think about turning html tables into Div tables.
// import { AuctionsDiv } from "@app/components/AuctionsDiv";
import { toEth } from "@app/utils";
import { Truncate } from "@app/components/Truncate";
import { TimeAgo } from "@app/components/TimeAgo";
import { Tag } from "@app/components/Tag";
import AuctionActions from "@app/components/auction/AuctionActions";
import AuctionTimer from "@app/components/auction/AuctionTimer";

const Auction: NextPage = () => {
  const { t } = useTranslation("common");
  const { allAuctions } = useAuctionHouse();

  if (!allAuctions || allAuctions.length === 0) {
    return <Layout>Loading auctions...</Layout>; // Or some other loading/error handling
  }

  const settledAuctions = allAuctions.filter((auction) => auction.settled);
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
            formatter: (value, auction) => (auction.startTime === 0 ? "—" : Truncate(value, 12, "middle")),
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

      <Auctions
        listId="settled"
        title={t("settled")}
        auctions={settledAuctions}
        //filter={{ settled: true }}
        rowLink={true}
        columnsConfig={[
          {
            title: "#",
            field: "id",
          },
          { title: "tag", field: "tag", formatter: (tag, auction) => <Tag tag={tag} /> },
          { title: "price", field: "amount", formatter: (value, auction) => `${toEth(value, 4)}` },
          { title: "winner", field: "bidder.id", formatter: (value, auction) => Truncate(value, 12, "middle") },
          { title: "ended", field: "endTime", formatter: (value, auction) => <TimeAgo date={value * 1000} /> },
        ]}
      />

      <div className="col-span-12">
        <h2>Upcoming</h2>
      </div>
    </Layout>
  );
};

export default Auction;

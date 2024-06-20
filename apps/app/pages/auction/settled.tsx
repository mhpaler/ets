import type { NextPage } from "next";
import { TagType } from "@app/types/tag";
import Layout from "@app/layouts/default";
import useTranslation from "next-translate/useTranslation";
import { useSystem } from "@app/hooks/useSystem";
import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import { useCtags } from "@app/hooks/useCtags";
import { Auctions } from "@app/components/Auctions";
// TODO: Think about turning html tables into Div tables.
// import { AuctionsDiv } from "@app/components/AuctionsDiv";
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
  const {
    tags = [],
    nextTags,
    mutate,
  } = useCtags({
    orderBy: "tagAppliedInTaggingRecord",
    filter: { owner_: { id: platformAddress.toLowerCase() } },
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 1500,
    },
  });

  // Perform secondary sorting by timestamp on the client side
  const sortedTags = (tags as TagType[]).sort((a, b) => {
    // Check if tagAppliedInTaggingRecord is undefined for either a or b
    const tagAppliedA = a.tagAppliedInTaggingRecord ?? -Infinity;
    const tagAppliedB = b.tagAppliedInTaggingRecord ?? -Infinity;

    if (tagAppliedA === tagAppliedB) {
      return a.timestamp - b.timestamp; // Unix timestamp comparison (ascending order)
    }
    return tagAppliedB - tagAppliedA;
  });

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

      <Auctions
        listId="settled"
        title={t("settled")}
        auctions={settledAuctions}
        rowLink={true}
        columnsConfig={[
          {
            title: "#",
            field: "id",
          },
          { title: "tag", field: "tag", formatter: (tag, auction) => <Tag tag={tag} /> },
          { title: "price", field: "amount", formatter: (value, auction) => `${toEth(value, 4)}` },
          { title: "winner", field: "bidder.id", formatter: (value, auction) => Truncate(value, 13, "middle") },
          { title: "ended", field: "endTime", formatter: (value, auction) => <TimeAgo date={value * 1000} /> },
        ]}
      />
      {platformAddress}
      <Tags
        listId="upcomingTags"
        title={t("upcoming")}
        tags={sortedTags}
        rowLink={false}
        columnsConfig={[
          { title: "tag", field: "tag", formatter: (_, tag) => <Tag tag={tag} /> },
          { title: "created", field: "timestamp", formatter: (value, tag) => <TimeAgo date={value * 1000} /> },
          { title: t("creator"), field: "creator.id", formatter: (value, tag) => value },
          { title: t("relayer"), field: "relayer.id", formatter: (value, tag) => Truncate(value, 13, "middle") },
          { title: "tagging records", field: "tagAppliedInTaggingRecord" },
        ]}
      />
    </Layout>
  );
};

export default Auction;

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
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { TanstackTable } from "@app/components/TanstackTable";
import Link from "next/link";

const Auction: NextPage = () => {
  const { t } = useTranslation("common");
  const { platformAddress } = useSystem();
  const { tags = [] } = useCtags({
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

  const columnHelper = createColumnHelper();

  const activeColumns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "#",
        cell: (info) => {
          return (
            <Link href={`/auction/${info.getValue()}`} className="link link-primary">
              {info.getValue()}
            </Link>
          );
        },
      }),
      columnHelper.accessor("tag", {
        header: t("tag"),
        cell: (info) => <Tag tag={info.getValue()} />,
      }),
      columnHelper.accessor("amount", {
        header: t("current bid"),
        cell: (info) => {
          const auction = info.row.original as any;
          return auction.startTime === 0 ? "—" : `${toEth(info.getValue(), 5)} ETH`;
        },
      }),
      columnHelper.accessor("bidder.id", {
        header: t("bidder"),
        cell: (info) => {
          const auction = info.row.original as any;
          return auction.startTime === 0 ? "—" : Truncate(info.getValue(), 13, "middle");
        },
      }),
      columnHelper.accessor("endTime", {
        header: t("time left"),
        cell: (info) => {
          const auction = info.row.original as any;
          return <AuctionTimer auction={auction} />;
        },
      }),
      columnHelper.accessor("id", {
        header: "",
        cell: (info) => {
          const auction = info.row.original as any;
          return (
            <AuctionActions key={info.getValue()} auction={auction} buttonClasses="btn-primary btn-outline btn-sm" />
          );
        },
      }),
    ],
    [t],
  );

  const settledColumns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "#",
        cell: (info) => {
          return (
            <Link href={`/auction/${info.getValue()}`} className="link link-primary">
              {info.getValue()}
            </Link>
          );
        },
      }),
      columnHelper.accessor("tag", {
        header: t("tag"),
        cell: (info) => <Tag tag={info.getValue()} />,
      }),
      columnHelper.accessor("amount", {
        header: t("price"),
        cell: (info) => `${toEth(info.getValue(), 4)}`,
      }),
      columnHelper.accessor("bidder.id", {
        header: t("winner"),
        cell: (info) => Truncate(info.getValue(), 13, "middle"),
      }),
      columnHelper.accessor("endTime", {
        header: t("ended"),
        cell: (info) => <TimeAgo date={info.getValue() * 1000} />,
      }),
    ],
    [t],
  );

  const upcomingColumns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "#",
        cell: (info) => {
          return (
            <Link href={`/auction/${info.getValue()}`} className="link link-primary">
              {info.getValue()}
            </Link>
          );
        },
      }),
      columnHelper.accessor("tag", {
        header: t("tag"),
        cell: (info) => <Tag tag={info.getValue()} />,
      }),
      columnHelper.accessor("amount", {
        header: t("price"),
        cell: (info) => `${toEth(info.getValue(), 4)}`,
      }),
      columnHelper.accessor("bidder.id", {
        header: t("winner"),
        cell: (info) => Truncate(info.getValue(), 13, "middle"),
      }),
      columnHelper.accessor("endTime", {
        header: t("ended"),
        cell: (info) => <TimeAgo date={info.getValue() * 1000} />,
      }),
    ],
    [t],
  );

  if (!allAuctions || allAuctions.length === 0) {
    return <Layout>Loading auctions...</Layout>;
  }

  const settledAuctions = allAuctions.filter((auction) => auction.settled);
  const activeAuctions = allAuctions
    .filter((auction) => auction.startTime === 0 || auction.settled === false)
    .sort((a, b) => b.id - a.id);

  return (
    <Layout>
      <TanstackTable
        columns={activeColumns}
        data={activeAuctions}
        loading={!activeAuctions.length}
        title={t("active")}
        rowLink={(auction) => `/auction/${auction.id}`}
      />
      <TanstackTable
        columns={settledColumns}
        data={settledAuctions}
        loading={!settledAuctions.length}
        title={t("settled")}
        rowLink={(auction) => `/auction/${auction.id}`}
      />
      <TanstackTable columns={upcomingColumns} data={sortedTags} loading={!sortedTags.length} title={t("upcoming")} />
    </Layout>
  );
};

export default Auction;

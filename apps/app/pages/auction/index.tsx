import Address from "@app/components/Address";
import { Tag } from "@app/components/Tag";
import { TanstackTable } from "@app/components/TanstackTable";
import { TimeAgo } from "@app/components/TimeAgo";
import AuctionActions from "@app/components/auction/AuctionActions";
import AuctionTimer from "@app/components/auction/AuctionTimer";
import { AuctionProvider } from "@app/context/AuctionContext";
import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import { useCtags } from "@app/hooks/useCtags";
import { useSystem } from "@app/hooks/useSystem";
import Layout from "@app/layouts/default";
import type { Auction } from "@app/types/auction";
import type { TagType } from "@app/types/tag";
import { toEth } from "@app/utils";
import { createColumnHelper } from "@tanstack/react-table";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { memo, useMemo, useState } from "react";

// Memoized child components
const MemoizedTag = memo(({ tag }: { tag: TagType }) => <Tag tag={tag} />);

const MemoizedAddress = memo(({ address, ens }: { address: string; ens?: string }) => (
  <Address address={address} ens={ens} />
));

const MemoizedTimeAgo = memo(({ date }: { date: number }) => <TimeAgo date={date} />);

const MemoizedAuctionTimer = memo(({ auction }: { auction: Auction }) => <AuctionTimer auction={auction} />);

const AuctionCell = memo(
  ({ auction }: { auction: Auction }) => {
    return (
      <AuctionProvider auctionId={auction.id}>
        <AuctionActions auction={auction} buttonClasses="btn-primary btn-outline btn-sm" />
      </AuctionProvider>
    );
  },
  (prev, next) => {
    const equal = prev.auction.id === next.auction.id;
    return equal;
  },
);

AuctionCell.displayName = "AuctionCell";

const MemoizedAddressLink = memo(({ href, address, ens }: { href: string; address: string; ens?: string }) => (
  <Link href={href} className="link link-primary" onClick={(e) => e.stopPropagation()}>
    <MemoizedAddress address={address} ens={ens} />
  </Link>
));

const AuctionPage: NextPage = () => {
  const { t } = useTranslation("common");
  const { platformAddress } = useSystem();
  const { allAuctions } = useAuctionHouse();
  const [pageIndex, _setPageIndex] = useState(0);

  // Memoize the tags configuration
  const tagsConfig = useMemo(
    () => ({
      skip: pageIndex * 20,
      orderBy: "tagAppliedInTaggingRecord",
      filter: { owner_: { id: platformAddress.toLowerCase() } },
    }),
    [pageIndex, platformAddress],
  );

  const { tags = [] } = useCtags(tagsConfig);

  // Memoize filtered and sorted data
  const filteredData = useMemo(() => {
    const filterEligibleTags = (tags: TagType[]): TagType[] =>
      tags.filter(
        (tag) => !tag.auctions || tag.auctions.length === 0 || tag.auctions.every((auction) => auction.settled),
      );

    const upcomingTags = filterEligibleTags(tags as TagType[]).sort((a, b) => {
      const tagAppliedA = a.tagAppliedInTaggingRecord ?? Number.NEGATIVE_INFINITY;
      const tagAppliedB = b.tagAppliedInTaggingRecord ?? Number.NEGATIVE_INFINITY;

      if (tagAppliedA === tagAppliedB) {
        return a.timestamp - b.timestamp;
      }
      return tagAppliedB - tagAppliedA;
    });

    const settledAuctions = allAuctions.filter((auction) => auction.settled);
    const activeAuctions = allAuctions
      .filter((auction) => auction.startTime === 0 || auction.settled === false)
      .sort((a, b) => b.id - a.id);

    return {
      upcomingTags,
      settledAuctions,
      activeAuctions,
    };
  }, [allAuctions, tags]);

  const columnHelper = createColumnHelper();

  const activeColumns = useMemo(
    () => [
      columnHelper.accessor("tag", {
        header: t("tag"),
        cell: (info) => <MemoizedTag tag={info.getValue()} />,
      }),
      columnHelper.accessor("amount", {
        header: t("current bid"),
        cell: (info) => {
          const auction = info.row.original as Auction;
          return auction.startTime === 0 ? "—" : `${toEth(info.getValue(), 5)} ETH`;
        },
      }),
      columnHelper.accessor("bidder", {
        header: t("bidder"),
        cell: (info) => {
          const auction = info.row.original as Auction;
          if (auction.startTime === 0) return "—";
          const bidder = info.getValue() as { ens?: string; id: string };
          return <MemoizedAddress address={bidder.id} ens={bidder.ens} />;
        },
      }),
      columnHelper.accessor("endTime", {
        header: t("time left"),
        cell: (info) => {
          const auction = info.row.original as Auction;
          return <MemoizedAuctionTimer auction={auction} />;
          //return "Timer disabled";
        },
      }),
      columnHelper.accessor("id", {
        header: "",
        cell: (info) => {
          const auction = info.row.original as Auction;
          return <AuctionCell auction={auction} />;
        },
      }),
    ],
    [t, columnHelper.accessor],
  );

  const upcomingColumns = useMemo(
    () => [
      columnHelper.accessor("display", {
        header: () => t("tag"),
        cell: (info) => <MemoizedTag tag={info.row.original as TagType} />,
      }),
      columnHelper.accessor("tagAppliedInTaggingRecord", {
        header: t("tagging-records"),
      }),
      columnHelper.accessor("timestamp", {
        header: t("tag-created"),
        cell: (info) => <MemoizedTimeAgo date={info.getValue() * 1000} />,
      }),
      columnHelper.accessor("creator", {
        header: t("tag-creator"),
        cell: (info) => {
          const owner = info.getValue() as { ens?: string; id: string };
          return <MemoizedAddressLink href={`/explore/creators/${owner.id}`} address={owner.id} ens={owner.ens} />;
        },
      }),
    ],
    [t, columnHelper.accessor],
  );

  const settledColumns = useMemo(
    () => [
      columnHelper.accessor("tag", {
        header: t("tag"),
        cell: (info) => <MemoizedTag tag={info.getValue()} />,
      }),
      columnHelper.accessor("amount", {
        header: t("price"),
        cell: (info) => `${toEth(info.getValue(), 4)}`,
      }),
      columnHelper.accessor("bidder", {
        header: t("winner"),
        cell: (info) => {
          const bidder = info.getValue() as { ens?: string; id: string };
          return <MemoizedAddressLink href={`/explore/owners/${bidder.id}`} address={bidder.id} ens={bidder.ens} />;
        },
      }),
      columnHelper.accessor("endTime", {
        header: t("ended"),
        cell: (info) => <MemoizedTimeAgo date={info.getValue() * 1000} />,
      }),
    ],
    [t, columnHelper.accessor],
  );

  return (
    <Layout>
      <div role="tablist" className="tabs tabs-lg col-span-12 auctions">
        <input type="radio" name="auctions" role="tab" className="tab" aria-label={t("active")} defaultChecked />
        <div role="tabpanel" className="tab-content">
          <TanstackTable
            columns={activeColumns}
            data={filteredData.activeAuctions}
            loading={!filteredData.activeAuctions.length}
            rowLink={(auction) => `/explore/ctags/${auction.tag.machineName}`}
          />
        </div>

        <input type="radio" name="auctions" role="tab" className="tab" aria-label={t("upcoming")} />
        <div role="tabpanel" className="tab-content">
          <TanstackTable
            columns={upcomingColumns}
            data={filteredData.upcomingTags}
            loading={!filteredData.upcomingTags.length}
            rowLink={(tag) => `/explore/ctags/${tag.machineName}`}
          />
        </div>

        <input type="radio" name="auctions" role="tab" className="tab" aria-label={t("settled")} />
        <div role="tabpanel" className="tab-content">
          <TanstackTable
            columns={settledColumns}
            data={filteredData.settledAuctions}
            loading={!filteredData.settledAuctions.length}
            rowLink={(auction) => `/explore/ctags/${auction.tag.machineName}`}
          />
        </div>
      </div>
    </Layout>
  );
};

export default memo(AuctionPage);

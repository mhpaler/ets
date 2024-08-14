import { useState, useMemo } from "react";
import type { NextPage } from "next";
import { TagType } from "@app/types/tag";
import Layout from "@app/layouts/default";
import useTranslation from "next-translate/useTranslation";
import { useSystem } from "@app/hooks/useSystem";
import { AuctionProvider } from "@app/context/AuctionContext";
import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import { useCtags } from "@app/hooks/useCtags";
import { toEth } from "@app/utils";
import { Truncate } from "@app/components/Truncate";
import { TimeAgo } from "@app/components/TimeAgo";
import { Tag } from "@app/components/Tag";
import AuctionActions from "@app/components/auction/AuctionActions";
import AuctionTimer from "@app/components/auction/AuctionTimer";
import { createColumnHelper } from "@tanstack/react-table";
import { TanstackTable } from "@app/components/TanstackTable";
import Address from "@app/components/Address";
import Link from "next/link";

const Auction: NextPage = () => {
  const { t } = useTranslation("common");
  const { platformAddress } = useSystem();
  const { allAuctions } = useAuctionHouse();

  const [pageIndex, setPageIndex] = useState(0);
  const { tags = [], nextTags } = useCtags({
    skip: pageIndex * 20,
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

  // Function to print debugging information
  const printDebugInfo = (tags: TagType[]) => {
    tags.forEach((tag) => {
      console.log(`Tag ID: ${tag.display}`);
      if (tag.auctions) {
        tag.auctions.forEach((auction) => {
          console.log(`  Auction ID: ${auction.display}, Status: ${auction.settled ? "Settled" : "Active"}`);
        });
      } else {
        console.log("  No auctions available for this tag.");
      }
    });
  };

  // Function to filter out tags with active auctions
  const filterEligibleTags = (tags: TagType[]): TagType[] => {
    //printDebugInfo(tags);
    return tags.filter(
      (tag) => !tag.auctions || tag.auctions.length === 0 || tag.auctions.every((auction) => auction.settled),
    );
  };

  // Perform secondary sorting by timestamp on the client side and filter eligible tags
  const upcomingTags = filterEligibleTags(tags as TagType[]).sort((a, b) => {
    const tagAppliedA = a.tagAppliedInTaggingRecord ?? -Infinity;
    const tagAppliedB = b.tagAppliedInTaggingRecord ?? -Infinity;

    if (tagAppliedA === tagAppliedB) {
      return a.timestamp - b.timestamp; // Unix timestamp comparison (ascending order)
    }
    return tagAppliedB - tagAppliedA;
  });

  const settledAuctions = allAuctions.filter((auction) => auction.settled);
  const activeAuctions = allAuctions
    .filter((auction) => auction.startTime === 0 || auction.settled === false)
    .sort((a, b) => b.id - a.id);

  const columnHelper = createColumnHelper();
  const activeColumns = useMemo(
    () => [
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
      columnHelper.accessor("bidder", {
        header: t("bidder"),
        cell: (info) => {
          const auction = info.row.original as any;
          if (auction.startTime === 0) return "—";
          const bidder = info.getValue() as { ens?: string; id: string };
          return <Address address={bidder.id} ens={bidder.ens} />;
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
            <AuctionProvider key={auction.id} auctionId={auction.id}>
              <AuctionActions key={info.getValue()} auction={auction} buttonClasses="btn-primary btn-outline btn-sm" />
            </AuctionProvider>
          );
        },
      }),
    ],
    [t],
  );

  const upcomingColumns = useMemo(
    () => [
      columnHelper.accessor("display", {
        header: () => t("tag"),
        cell: (info) => <Tag tag={info.row.original as TagType} />,
      }),
      columnHelper.accessor("tagAppliedInTaggingRecord", {
        header: t("tagging-records"),
      }),
      columnHelper.accessor("timestamp", {
        header: t("tag-created"),
        cell: (info) => <TimeAgo date={info.getValue() * 1000} />,
      }),
      columnHelper.accessor("creator", {
        header: t("tag-creator"),
        cell: (info) => {
          const owner = info.getValue() as { ens?: string; id: string };
          return (
            <Link
              href={`/explore/creators/${owner.id}`}
              className="link link-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <Address address={owner.id} ens={owner.ens} />
            </Link>
          );
        },
      }),
    ],
    [t],
  );

  const settledColumns = useMemo(
    () => [
      /*       columnHelper.accessor("id", {
        header: "#",
        cell: (info) => {
          return (
            <Link href={`/auction/${info.getValue()}`} className="link link-primary">
              {info.getValue()}
            </Link>
          );
        },
      }), */
      columnHelper.accessor("tag", {
        header: t("tag"),
        cell: (info) => <Tag tag={info.getValue()} />,
      }),
      columnHelper.accessor("amount", {
        header: t("price"),
        cell: (info) => `${toEth(info.getValue(), 4)}`,
      }),
      columnHelper.accessor("bidder", {
        header: t("winner"),
        cell: (info) => {
          const bidder = info.getValue() as { ens?: string; id: string };
          return (
            <Link
              href={`/explore/owners/${bidder.id}`}
              className="link link-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <Address address={bidder.id} ens={bidder.ens} />
            </Link>
          );
        },
      }),
      columnHelper.accessor("endTime", {
        header: t("ended"),
        cell: (info) => <TimeAgo date={info.getValue() * 1000} />,
      }),
    ],
    [t],
  );

  return (
    <Layout>
      {/*
      <div className="dropdown dropdown-hover dropdown-end">
        <div tabIndex={0} role="button" className="text-info">
          <svg
            tabIndex={0}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="h-4 w-4 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <div tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
          <p className="font-semibold">Upcoming Auctions</p>
          <p>Tags with the most tagging records are released next.</p>
        </div>
      </div>
      */}
      <div role="tablist" className="tabs tabs-lg col-span-12 auctions">
        <input type="radio" name="auctions" role="tab" className="tab" aria-label={t("active")} defaultChecked />
        <div role="tabpanel" className="tab-content">
          <TanstackTable
            columns={activeColumns}
            data={activeAuctions}
            loading={!activeAuctions.length}
            rowLink={(auction) => `/explore/tags/${auction.tag.machineName}`}
          />
        </div>

        <input type="radio" name="auctions" role="tab" className="tab" aria-label={t("upcoming")} />
        <div role="tabpanel" className="tab-content">
          <TanstackTable
            columns={upcomingColumns}
            data={upcomingTags}
            loading={!upcomingTags.length}
            rowLink={(tag) => `/explore/tags/${tag.machineName}`}
          />
        </div>

        <input type="radio" name="auctions" role="tab" className="tab" aria-label={t("settled")} />
        <div role="tabpanel" className="tab-content">
          <TanstackTable
            columns={settledColumns}
            data={settledAuctions}
            loading={!settledAuctions.length}
            rowLink={(auction) => `/explore/tags/${auction.tag.machineName}`}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Auction;

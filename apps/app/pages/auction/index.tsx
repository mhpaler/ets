import Address from "@app/components/Address";
import { Tag } from "@app/components/Tag";
import { TimeAgo } from "@app/components/TimeAgo";
import AuctionActions from "@app/components/auction/AuctionActions";
import AuctionTableContent from "@app/components/auction/AuctionTableContent";
import AuctionTimer from "@app/components/auction/AuctionTimer";
import { AuctionProvider } from "@app/context/AuctionContext";
import { AuctionHouseProvider } from "@app/context/AuctionHouseContext";
import Layout from "@app/layouts/default";
import type { TagType } from "@app/types/tag";
import { toEth } from "@app/utils";
import { createColumnHelper } from "@tanstack/react-table";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { useMemo } from "react";

const AuctionPage: NextPage = () => {
  const { t } = useTranslation("common");
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
    [t, columnHelper.accessor],
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
    [t, columnHelper.accessor],
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
    [t, columnHelper.accessor],
  );

  return (
    <Layout>
      <AuctionHouseProvider>
        <div role="tablist" className="tabs tabs-lg col-span-12 auctions">
          <input type="radio" name="auctions" role="tab" className="tab" aria-label={t("active")} defaultChecked />
          <div role="tabpanel" className="tab-content">
            <AuctionTableContent type="active" columns={activeColumns} />
          </div>

          <input type="radio" name="auctions" role="tab" className="tab" aria-label={t("upcoming")} />
          <div role="tabpanel" className="tab-content">
            <AuctionTableContent type="upcoming" columns={upcomingColumns} />
          </div>

          <input type="radio" name="auctions" role="tab" className="tab" aria-label={t("settled")} />
          <div role="tabpanel" className="tab-content">
            <AuctionTableContent type="settled" columns={settledColumns} />
          </div>
        </div>
      </AuctionHouseProvider>
    </Layout>
  );
};

export default AuctionPage;

import Address from "@app/components/Address";
import { TanstackTable } from "@app/components/TanstackTable";
import { useCreators } from "@app/hooks/useCreators";
import { useCurrentChain } from "@app/hooks/useCurrentChain";
import useNumberFormatter from "@app/hooks/useNumberFormatter";
import Layout from "@app/layouts/default";
import type { CreatorType } from "@app/types/creator";
import { timestampToString } from "@app/utils";
import { toEth } from "@app/utils";
import { createColumnHelper } from "@tanstack/react-table";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { useMemo, useState } from "react";

const pageSize = 20;

const Creators: NextPage = () => {
  const { t } = useTranslation("common");
  const [pageIndex, setPageIndex] = useState(0);
  const { number } = useNumberFormatter();
  const chain = useCurrentChain();
  const { creators, nextCreators } = useCreators({
    pageSize,
    skip: pageIndex * pageSize,
  });

  const columnHelper = createColumnHelper<CreatorType>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: () => t("creator") as string,
        cell: (info) => {
          const creator = info.row.original as CreatorType;
          return (
            <Link href={`/explore/creators/${creator.id}`} className="link link-primary">
              <Address address={creator.id} ens={creator.ens} />
            </Link>
          );
        },
      }),
      columnHelper.accessor("firstSeen", {
        header: t("first-seen") as string,
        cell: (info) => timestampToString(Number.parseInt(info.getValue() as string)),
      }),
      columnHelper.accessor("tagsCreated", {
        header: t("tags-created") as string,
        cell: (info) => number(Number.parseInt(info.getValue() as string)),
      }),
      columnHelper.accessor(
        (row) => {
          const creatorRow = row as CreatorType;
          const taggingRevenue = Number.parseFloat(creatorRow.createdTagsTaggingFeeRevenue);
          const auctionRevenue = Number.parseFloat(creatorRow.createdTagsAuctionRevenue);
          return taggingRevenue + auctionRevenue;
        },
        {
          id: "totalRevenue",
          header: t("total-revenue") as string,
          cell: (info) => `${toEth(info.getValue() as number, 8)} ${chain?.nativeCurrency.symbol}`,
        },
      ),
    ],
    [t, number, chain?.nativeCurrency.symbol, columnHelper.accessor],
  );

  return (
    <Layout>
      <TanstackTable
        columns={columns}
        data={creators}
        loading={!creators?.length}
        rowsPerPage={pageSize}
        hasNextPage={!!nextCreators?.length}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        rowLink={(creator: any) => `/explore/creators/${creator.id}`}
      />
    </Layout>
  );
};

export default Creators;

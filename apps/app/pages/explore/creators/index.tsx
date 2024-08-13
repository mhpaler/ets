import { useMemo, useState } from "react";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import { timestampToString } from "@app/utils";
import { toEth } from "@app/utils";
import useNumberFormatter from "@app/hooks/useNumberFormatter";
import { useCreators } from "@app/hooks/useCreators";
import Layout from "@app/layouts/default";
import { Truncate } from "@app/components/Truncate";
import { TanstackTable } from "@app/components/TanstackTable";
import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import { CopyAndPaste } from "@app/components/CopyAndPaste";
import { CreatorType } from "@app/types/creator";
import ENSAddress from "@app/components/ENSAddress";

const pageSize = 20;

const Creators: NextPage = () => {
  const { t } = useTranslation("common");
  const [pageIndex, setPageIndex] = useState(0);
  const { number } = useNumberFormatter();
  const { creators, nextCreators } = useCreators({
    pageSize,
    skip: pageIndex * pageSize,
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    },
  });
  console.log("creators", creators);

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: () => t("creator"),
        cell: (info) => {
          const creator = info.row.original as CreatorType;
          return (
            <>
              <Link href={`/explore/creators/${creator.id}`} className="link link-primary">
                <ENSAddress address={creator.id} ens={creator.ens} />
              </Link>
              <CopyAndPaste value={creator.id} />
            </>
          );
        },
      }),
      columnHelper.accessor("firstSeen", {
        header: t("first-seen"),
        cell: (info) => timestampToString(parseInt(info.getValue() as string)),
      }),
      columnHelper.accessor("tagsCreated", {
        header: t("tags-created"),
        cell: (info) => number(parseInt(info.getValue() as string)),
      }),
      columnHelper.accessor("createdTagsAuctionRevenue", {
        header: t("revenue"),
        cell: (info) => `${toEth(parseFloat(info.getValue() as string), 4)} ETH`,
      }),
    ],
    [t, number],
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

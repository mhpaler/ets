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

  const columnHelper = createColumnHelper();

  const columns = useMemo<any[]>(
    () => [
      columnHelper.accessor("id", {
        header: t("creator"),
        cell: (info) => {
          const creator = info.row.original as any;
          return (
            <>
              <Link href={`/creators/${creator.id}`} className="link link-primary">
                {Truncate(info.getValue())}
              </Link>
              <CopyAndPaste value={info.getValue()} />
            </>
          );
        },
      }),
      columnHelper.accessor("firstSeen", {
        header: t("first-seen"),
        cell: (info) => timestampToString(parseInt(info.getValue())),
      }),
      columnHelper.accessor("tagsCreated", {
        header: t("tags-created"),
        cell: (info) => number(parseInt(info.getValue())),
      }),
      columnHelper.accessor("revenue", {
        header: t("revenue"),
        cell: (info) => `${toEth(info.getValue(), 4)} MATIC`,
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
        rowLink={(creator: any) => `/creators/${creator.id}`}
      />
    </Layout>
  );
};

export default Creators;

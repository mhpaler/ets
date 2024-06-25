import { useMemo, useState } from "react";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import { useOwners } from "@app/hooks/useOwners";
import Layout from "@app/layouts/default";
import { TimeAgo } from "@app/components/TimeAgo";
import { Truncate } from "@app/components/Truncate";
import { TanstackTable } from "@app/components/TanstackTable";
import Link from "next/link";
import { createColumnHelper } from "@tanstack/react-table";
import { CopyAndPaste } from "@app/components/CopyAndPaste";
import useNumberFormatter from "@app/hooks/useNumberFormatter";

const pageSize = 20;

const Owners: NextPage = () => {
  const { t } = useTranslation("common");
  const [pageIndex, setPageIndex] = useState(0);
  const { number } = useNumberFormatter();
  const { owners } = useOwners({
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
        header: t("owner"),
        cell: (info) => {
          const owner = info.row.original as any;
          return (
            <>
              <Link href={`/owners/${owner.id}`} className="link link-primary">
                {Truncate(info.getValue())}
              </Link>
              <CopyAndPaste value={info.getValue()} />
            </>
          );
        },
      }),
      columnHelper.accessor("firstSeen", {
        header: t("first-seen"),
        cell: (info) => <TimeAgo date={info.getValue() * 1000} />,
      }),
      columnHelper.accessor("tagsOwned", {
        header: t("tags-owned", { timeframe: t("current") }),
        cell: (info) => number(parseInt(info.getValue())),
      }),
    ],
    [t, number],
  );

  return (
    <Layout>
      <TanstackTable
        columns={columns}
        data={owners}
        loading={!owners?.length}
        rowsPerPage={pageSize}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        rowLink={(owner: any) => `/owners/${owner.id}`}
      />
    </Layout>
  );
};

export default Owners;

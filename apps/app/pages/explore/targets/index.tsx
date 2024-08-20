import { CopyAndPaste } from "@app/components/CopyAndPaste";
import { TanstackTable } from "@app/components/TanstackTable";
import { TimeAgo } from "@app/components/TimeAgo";
import { Truncate } from "@app/components/Truncate";
import { URI } from "@app/components/URI";
import { useTargets } from "@app/hooks/useTargets";
import Layout from "@app/layouts/default";
import { createColumnHelper } from "@tanstack/react-table";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { useMemo, useState } from "react";

const pageSize = 20;

const Targets: NextPage = () => {
  const { t } = useTranslation("common");
  const [pageIndex, setPageIndex] = useState(0);
  const { targets, nextTargets } = useTargets({
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
        header: t("id"),
        cell: (info) => {
          const target = info.row.original as any;
          return (
            <div className="flex items-center">
              <Link href={`/explore/targets/${target.id}`} className="link link-primary">
                {Truncate(info.getValue(), 14, "middle")}
              </Link>
              <CopyAndPaste value={target.id} />
            </div>
          );
        },
      }),
      columnHelper.accessor("created", {
        header: t("created"),
        cell: (info) => <TimeAgo date={info.getValue() * 1000} />,
      }),
      columnHelper.accessor("targetURI", {
        header: t("URI"),
        cell: (info) => (
          <div className="flex items-center space-x-2">
            <span className="block truncate max-w-[60ch]">{info.getValue()}</span>
            <div className="flex-shrink-0 flex space-x-2">
              <CopyAndPaste value={info.getValue()} />
              <URI value={info.getValue()} />
            </div>
          </div>
        ),
      }),
    ],
    [t, columnHelper.accessor],
  );

  return (
    <Layout>
      <div className="col-span-12 max-w-screen-lg">
        <TanstackTable
          columns={columns}
          data={targets}
          loading={!targets?.length}
          rowsPerPage={pageSize}
          hasNextPage={!!nextTargets?.length}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          rowLink={(target: any) => `/explore/targets/${target.id}`}
        />
      </div>
    </Layout>
  );
};

export default Targets;

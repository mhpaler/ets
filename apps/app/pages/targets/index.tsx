import { useMemo, useState } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { useTargets } from "@app/hooks/useTargets";
import Layout from "@app/layouts/default";
import { TimeAgo } from "@app/components/TimeAgo";
import { TanstackTable } from "@app/components/TanstackTable";
import { createColumnHelper } from "@tanstack/react-table";
import { CopyAndPaste } from "@app/components/CopyAndPaste";
import { URI } from "@app/components/URI";
import { Truncate } from "@app/components/Truncate";

const pageSize = 20;

const Targets: NextPage = () => {
  const { t } = useTranslation("common");
  const [pageIndex, setPageIndex] = useState(0);
  const { targets } = useTargets({
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
            <Link href={`/targets/${target.id}`} className="link link-primary">
              {Truncate(info.getValue(), 24, "middle")}
            </Link>
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
          <div>
            <span className="line-clamp-1">{info.getValue()}</span>
            <CopyAndPaste value={info.getValue()} />
            <URI value={info.getValue()} />
          </div>
        ),
      }),
    ],
    [t],
  );

  return (
    <Layout>
      <div className="col-span-12 max-w-screen-lg">
        <TanstackTable
          columns={columns}
          data={targets}
          loading={!targets?.length}
          rowsPerPage={pageSize}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          rowLink={(target: any) => `/targets/${target.id}`}
        />
      </div>
    </Layout>
  );
};

export default Targets;

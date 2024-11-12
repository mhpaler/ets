import Address from "@app/components/Address";
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
  });

  const columnHelper = createColumnHelper();

  const columns = useMemo<any[]>(
    () => [
      columnHelper.accessor("id", {
        header: t("id"),
        cell: (info) => {
          const target = info.row.original as any;
          return (
            target.id && (
              <Address
                hoverText={false}
                copy={false}
                explorerLink={false}
                address={target.id}
                href={`/explore/targets/${target.id}`}
              />
            )
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
          <div className="flex items-center">
            <span className="block truncate max-w-[60ch]">{info.getValue()}</span>
            <div className="flex-shrink-0 flex">
              <CopyAndPaste value={info.getValue()} />
              <URI value={info.getValue()} hoverText={t("open-in-new-tab")} />
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

import Address from "@app/components/Address";
import { TanstackTable } from "@app/components/TanstackTable";
import useNumberFormatter from "@app/hooks/useNumberFormatter";
import { useTaggers } from "@app/hooks/useTaggers";
import Layout from "@app/layouts/default";
import type { TaggerType } from "@app/types/tagger";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import { useMemo, useState } from "react";

const pageSize = 20;

const Taggers: NextPage = () => {
  const { t } = useTranslation("common");
  const [pageIndex, setPageIndex] = useState(0);
  const { number } = useNumberFormatter();
  const { taggers, nextTaggers } = useTaggers({
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

  const columnHelper = createColumnHelper<TaggerType>();

  const columns: ColumnDef<TaggerType, any>[] = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: () => t("tagger"),
        cell: (info) => {
          const tagger = info.row.original;
          return <Address href={`/explore/taggers/${tagger.id}`} address={tagger.id} ens={tagger.ens} />;
        },
      }),
      columnHelper.accessor("taggingRecordsCreated", {
        header: () => t("tagging-records"),
        cell: (info) => number(info.getValue()),
      }),
    ],
    [t, number, columnHelper.accessor],
  );

  return (
    <Layout>
      <div className="col-span-12">
        <TanstackTable
          columns={columns}
          data={taggers}
          loading={!taggers?.length}
          rowsPerPage={pageSize}
          hasNextPage={!!nextTaggers?.length}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          rowLink={(tagger: TaggerType) => `/explore/taggers/${tagger.id}`}
        />
      </div>
    </Layout>
  );
};

export default Taggers;

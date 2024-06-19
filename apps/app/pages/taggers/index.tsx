import { useMemo } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { globalSettings } from "@app/config/globalSettings";
import { useTaggers } from "@app/hooks/useTaggers";
import Layout from "@app/layouts/default";
import { TanstackTable } from "@app/components/TanstackTable";
import { createColumnHelper } from "@tanstack/react-table";
import { CopyAndPaste } from "@app/components/CopyAndPaste";
import Link from "next/link";
import useNumberFormatter from "@app/hooks/useNumberFormatter";

const pageSize = 20;

const Creators: NextPage = () => {
  const { t } = useTranslation("common");
  const { number } = useNumberFormatter();
  const { taggers } = useTaggers({
    pageSize,
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
        header: t("tagger"),
        cell: (info) => {
          const tagger = info.row.original as any;
          return (
            <>
              <Link href={`/taggers/${tagger.id}`} className="link link-primary">
                {info.getValue()}
              </Link>
              <CopyAndPaste value={info.getValue()} />
            </>
          );
        },
      }),
      columnHelper.accessor("taggingRecordsCreated", {
        header: t("tagging-records"),
        cell: (info) => number(parseInt(info.getValue())),
      }),
    ],
    [t, number],
  );

  return (
    <Layout>
      <div className="col-span-12">
        <TanstackTable
          columns={columns}
          data={taggers}
          loading={!taggers?.length}
          rowsPerPage={pageSize}
          totalItems={taggers?.length}
          title={t("taggers")}
          rowLink={(tagger: any) => `/taggers/${tagger.id}`}
        />
      </div>
    </Layout>
  );
};

export default Creators;

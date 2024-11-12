import { globalSettings } from "@app/config/globalSettings";
import { useTaggingRecords } from "@app/hooks/useTaggingRecords";
import type { TaggingRecordType } from "@app/types/taggingrecord";
import { createColumnHelper } from "@tanstack/react-table";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { useMemo, useState } from "react";
import Address from "./Address";
import { Tag } from "./Tag";
import { TanstackTable } from "./TanstackTable";
import { TimeAgo } from "./TimeAgo";

type Props = {
  filter?: any;
  pageSize?: number;
  orderBy?: string;
  title?: string;
  visibleColumns?: string[];
};

const TaggingRecords: NextPage<Props> = ({
  filter,
  pageSize = globalSettings.DEFAULT_PAGESIZE,
  orderBy,
  title,
  visibleColumns,
}) => {
  const { t } = useTranslation("common");
  const [pageIndex, setPageIndex] = useState(0);
  const { taggingRecords, nextTaggingRecords, isLoading } = useTaggingRecords({
    filter: filter,
    pageSize: pageSize,
    skip: pageIndex * pageSize,
    orderBy: orderBy,
  });

  const columnHelper = createColumnHelper();
  const ALL_COLUMNS = useMemo(
    () => ({
      tagger: columnHelper.accessor("tagger.id", {
        header: t("tagger"),
        cell: (info) => {
          const tagger = (info.row.original as TaggingRecordType).tagger;
          return <Address href={`/explore/taggers/${tagger.id}`} address={tagger.id} ens={tagger.ens} />;
        },
      }),
      target: columnHelper.accessor("target.id", {
        header: t("target"),
        cell: (info) => (
          <Address
            copy={false}
            hoverText={false}
            explorerLink={false}
            href={`/explore/targets/${info.getValue()}`}
            address={info.getValue()}
          />
        ),
      }),
      tags: columnHelper.accessor("tags", {
        header: t("tags"),
        cell: (info) => (
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            onKeyUp={(e) => {
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
          >
            {(info.getValue() as any[]).map((tag: any, i: number) => (
              <span key={i} className="mr-2 pb-2 inline-block">
                <Tag tag={tag} />
              </span>
            ))}
          </div>
        ),
      }),
      id: columnHelper.accessor("id", {
        header: t("id"),
        cell: (info) => {
          const taggingRecord = info.row.original as TaggingRecordType;
          return (
            <Address
              copy={false}
              hoverText={false}
              explorerLink={false}
              href={`/explore/tagging-records/${taggingRecord.id}`}
              address={taggingRecord.id}
            />
          );
        },
      }),
      timestamp: columnHelper.accessor("timestamp", {
        header: t("created"),
        cell: (info) => <TimeAgo date={info.getValue() * 1000} />,
      }),
      relayer: columnHelper.accessor("relayer.id", {
        header: t("relayer"),
        cell: (info) => {
          const relayer = (info.row.original as TaggingRecordType).relayer;
          return (
            <Link
              onClick={(e) => {
                e.stopPropagation();
              }}
              href={`/explore/relayers/${relayer.id}`}
              className="link link-primary"
            >
              {relayer.name}
            </Link>
          );
        },
      }),
      recordType: columnHelper.accessor("recordType", {
        header: t("record-type"),
        cell: (info) => info.getValue(),
      }),
    }),
    [t, columnHelper.accessor],
  );

  const columns = useMemo(() => {
    if (!visibleColumns) {
      const defaultColumns = ["timestamp", "target", "tags", "tagger", "relayer"];
      return defaultColumns.map((columnKey) => ALL_COLUMNS[columnKey as keyof typeof ALL_COLUMNS]);
    }
    return visibleColumns.map((columnKey) => ALL_COLUMNS[columnKey as keyof typeof ALL_COLUMNS]);
  }, [ALL_COLUMNS, visibleColumns]);

  return (
    <TanstackTable
      columns={columns}
      data={taggingRecords}
      loading={isLoading}
      rowsPerPage={pageSize}
      title={title}
      rowLink={(taggingRecord: any) => `/explore/tagging-records/${taggingRecord.id}`}
      hasNextPage={!!nextTaggingRecords?.length}
      pageIndex={pageIndex}
      setPageIndex={setPageIndex}
    />
  );
};
export { TaggingRecords };

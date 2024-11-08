import { globalSettings } from "@app/config/globalSettings";
import { useExplorerUrl } from "@app/hooks/useExplorerUrl";
import { useTaggingRecords } from "@app/hooks/useTaggingRecords";
import type { TaggingRecordType } from "@app/types/taggingrecord";
import { createColumnHelper } from "@tanstack/react-table";
import { id } from "ethers/lib/utils.js";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CopyAndPaste } from "./CopyAndPaste";
import { Tag } from "./Tag";
import { TanstackTable } from "./TanstackTable";
import { TimeAgo } from "./TimeAgo";
import { Truncate } from "./Truncate";
import { URI } from "./URI";

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
  const getExplorerUrl = useExplorerUrl();
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
          return (
            <div className="flex items-center">
              <Link
                onClick={(e) => {
                  e.stopPropagation();
                }}
                href={`/explore/taggers/${tagger.id}`}
                className="link link-primary"
              >
                {Truncate(info.getValue(), 14, "middle")}
              </Link>
              <CopyAndPaste value={info.getValue()} />
              <URI value={getExplorerUrl("address", tagger.id)} />
            </div>
          );
        },
      }),
      target: columnHelper.accessor("target.id", {
        header: t("target"),
        cell: (info) => (
          <div className="flex items-center">
            <Link
              onClick={(e) => {
                e.stopPropagation();
              }}
              href={`/explore/targets/${info.getValue()}`}
              className="link link-primary"
            >
              {Truncate(info.getValue(), 14, "middle")}
            </Link>
            <CopyAndPaste value={info.getValue()} />
          </div>
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
          const tag = info.row.original as TaggingRecordType;
          return (
            <div className="flex items-center">
              <Link
                onClick={(e) => {
                  e.stopPropagation();
                }}
                href={`/explore/tagging-records/${tag.id}`}
                className="link link-primary"
              >
                {Truncate(info.getValue(), 14, "middle")}
              </Link>
              <CopyAndPaste value={info.getValue()} />
              <URI value={getExplorerUrl("tx", tag.txnHash)} />
            </div>
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
    [t, getExplorerUrl, columnHelper.accessor],
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

import { globalSettings } from "@app/config/globalSettings";
import { useTaggingRecords } from "@app/hooks/useTaggingRecords";
import { createColumnHelper } from "@tanstack/react-table";
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
import { getExplorerUrl } from "@app/config/wagmiConfig";
import { useChainId } from "wagmi";

type Props = {
  filter?: any;
  pageSize?: number;
  orderBy?: string;
  title?: string;
};

const TaggingRecords: NextPage<Props> = ({ filter, pageSize = globalSettings.DEFAULT_PAGESIZE, orderBy, title }) => {
  const { t } = useTranslation("common");
  const [pageIndex, setPageIndex] = useState(0);
  const chainId = useChainId();

  const { taggingRecords, nextTaggingRecords } = useTaggingRecords({
    filter: filter,
    pageSize: pageSize,
    skip: pageIndex * pageSize,
    orderBy: orderBy,
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 1000,
    },
  });

  const columnHelper = createColumnHelper();

  const columns = useMemo<any[]>(
    () => [
      columnHelper.accessor("id", {
        header: t("id"),
        cell: (info) => (
          <div className="flex items-center">
            <Link
              onClick={(e) => {
                e.stopPropagation();
              }}
              href={`/explore/tagging-records/${info.getValue()}`}
              className="link link-primary"
            >
              {Truncate(info.getValue(), 14, "middle")}
            </Link>
            <CopyAndPaste value={info.getValue()} />
            <URI value={getExplorerUrl(chainId, 'tx', info.getValue())} />
          </div>
        ),
      }),
      columnHelper.accessor("timestamp", {
        header: t("created"),
        cell: (info) => <TimeAgo date={info.getValue() * 1000} />,
      }),
      columnHelper.accessor("relayer.id", {
        header: t("relayer"),
        cell: (info) => {
          const relayer = (info.row.original as any).relayer;
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
      columnHelper.accessor("recordType", {
        header: t("record-type"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("target.id", {
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
      columnHelper.accessor("tags", {
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
    ],
    [t, columnHelper.accessor],
  );

  return (
    <TanstackTable
      columns={columns}
      data={taggingRecords}
      loading={!taggingRecords?.length}
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

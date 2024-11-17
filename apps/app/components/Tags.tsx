import Address from "@app/components/Address";
import { Tag } from "@app/components/Tag";
import { TanstackTable } from "@app/components/TanstackTable";
import { TimeAgo } from "@app/components/TimeAgo";
import { globalSettings } from "@app/config/globalSettings";
import { useCurrentChain } from "@app/hooks/useCurrentChain";
import type { TagType } from "@app/types/tag";
import { toEth } from "@app/utils";
import { createColumnHelper } from "@tanstack/react-table";
import useTranslation from "next-translate/useTranslation";
import type React from "react";
import { useMemo } from "react";

type ColumnKey = "tag" | "created" | "owner" | "creator" | "relayer" | "timestamp" | "taggingRecords" | "totalRevenue";

type Props = {
  loading: boolean;
  title?: string;
  pageSize?: number;
  tags: TagType[];
  columns: ColumnKey[];
  rowLink?: boolean | ((tag: TagType) => string);
  pageIndex?: number;
  setPageIndex?: (index: number) => void;
  hasNextPage?: boolean;
};

const Tags: React.FC<Props> = ({
  loading,
  title,
  tags,
  pageSize = globalSettings.DEFAULT_PAGESIZE,
  columns,
  rowLink,
  pageIndex,
  setPageIndex,
  hasNextPage,
}) => {
  const { t } = useTranslation("common");
  const chain = useCurrentChain();
  const columnHelper = createColumnHelper<TagType>();
  const columnConfigs = useMemo(
    () => ({
      tag: columnHelper.accessor("display", {
        header: () => "Tag",
        cell: (info) => <Tag tag={info.row.original} />,
      }),
      created: columnHelper.accessor("timestamp", {
        header: () => "Created",
        cell: (info) => <TimeAgo date={info.getValue() * 1000} />,
      }),
      owner: columnHelper.accessor("owner", {
        header: () => t("owner"),
        cell: (info) => {
          const owner = info.getValue();
          return <Address href="{`/explore/owners/${owner.id}`}" address={owner.id} ens={owner.ens} />;
        },
      }),
      creator: columnHelper.accessor("creator", {
        header: () => t("creator"),
        cell: (info) => {
          const creator = info.getValue();
          return <Address href={`/explore/creators/${creator.id}`} address={creator.id} ens={creator.ens} />;
        },
      }),
      relayer: columnHelper.accessor("relayer.id", {
        header: () => t("relayer"),
        cell: (info) => <Address href={`/explore/relayers/${info.getValue()}`} address={info.getValue()} />,
      }),
      timestamp: columnHelper.accessor("timestamp", {
        header: () => "Created",
        cell: (info) => <TimeAgo date={info.getValue() * 1000} />,
      }),
      taggingRecords: columnHelper.accessor("tagAppliedInTaggingRecord", {
        header: () => "Tagging Records",
        id: "taggingRecords",
      }),
      totalRevenue: columnHelper.accessor(
        (row) => {
          return (
            Number(row.relayerRevenue) +
            Number(row.ownerRevenue) +
            Number(row.protocolRevenue) +
            Number(row.creatorRevenue)
          );
        },
        {
          header: () => t("total-revenue"),
          id: "totalRevenue",
          cell: (info) => (
            <span>
              {toEth(info.getValue(), 8)} {chain?.nativeCurrency.symbol}
            </span>
          ),
        },
      ),
    }),
    [columnHelper, t, chain?.nativeCurrency.symbol],
  );

  const selectedColumns = useMemo(
    () => columns.map((key) => columnConfigs[key]).filter(Boolean),
    [columns, columnConfigs],
  );

  return (
    <TanstackTable
      loading={loading}
      columns={selectedColumns}
      data={tags}
      hasNextPage={hasNextPage}
      rowsPerPage={pageSize}
      title={title}
      pageIndex={pageIndex}
      setPageIndex={setPageIndex}
      rowLink={typeof rowLink === "function" ? rowLink : rowLink ? (tag: TagType) => `/tag/${tag.id}` : undefined}
    />
  );
};

export { Tags };

import { TanstackTable } from "@app/components/TanstackTable";
import { globalSettings } from "@app/config/globalSettings";
import type { TagType } from "@app/types/tag";
import { createColumnHelper } from "@tanstack/react-table";
import useTranslation from "next-translate/useTranslation";
import type React from "react";
import { useMemo } from "react";

type Props = {
  title?: string;
  pageSize?: number;
  tags: TagType[];
  columnsConfig: any[];
  rowLink: boolean | ((tag: TagType) => string);
  pageIndex?: number;
  setPageIndex?: (index: number) => void;
  hasNextPage?: boolean;
};

const Tags: React.FC<Props> = ({
  title,
  tags,
  pageSize = globalSettings.DEFAULT_PAGESIZE,
  columnsConfig,
  rowLink,
  pageIndex,
  setPageIndex,
  hasNextPage,
}) => {
  const { t } = useTranslation("common");
  const columnHelper = createColumnHelper<TagType>();

  const columns = useMemo(
    () =>
      columnsConfig.map((column) =>
        columnHelper.accessor(column.field, {
          header: () => t(column.title),
          cell: (info) => column.formatter(info.getValue(), info.row.original),
        }),
      ),
    [columnsConfig, t, columnHelper.accessor],
  );

  return (
    <div className="col-span-12">
      <TanstackTable
        columns={columns}
        data={tags}
        hasNextPage={hasNextPage}
        loading={!tags?.length}
        rowsPerPage={pageSize}
        title={title}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        rowLink={typeof rowLink === "function" ? rowLink : rowLink ? (tag: TagType) => `/tag/${tag.id}` : undefined}
      />
    </div>
  );
};

export { Tags };

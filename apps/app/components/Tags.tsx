import type { NextPage } from "next";
import { useMemo } from "react";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { globalSettings } from "@app/config/globalSettings";
import { TanstackTable } from "@app/components/TanstackTable";
import { TagType } from "@app/types/tag";
import { createColumnHelper } from "@tanstack/react-table";

type Props = {
  title?: string;
  pageSize?: number;
  tags: TagType[];
  columnsConfig: any[];
  rowLink: boolean;
  pageIndex?: number;
  setPageIndex?: (index: number) => void;
};

const Tags: NextPage<Props> = ({
  title,
  tags,
  pageSize = globalSettings["DEFAULT_PAGESIZE"],
  columnsConfig,
  rowLink,
  pageIndex,
  setPageIndex,
}) => {
  const { t } = useTranslation("common");

  const columnHelper = createColumnHelper<TagType>();

  const columns = useMemo<any[]>(
    () =>
      columnsConfig.map((column) =>
        columnHelper.accessor(column.field, {
          header: () => t(column.title),
          cell: (info) => {
            const tag = info.row.original;
            return column.formatter ? column.formatter(info.getValue(), tag) : info.getValue();
          },
        }),
      ),
    [columnsConfig, t],
  );

  return (
    <div className="col-span-12">
      <TanstackTable
        columns={columns}
        data={tags}
        loading={!tags?.length}
        rowsPerPage={pageSize}
        title={title}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        rowLink={rowLink ? (tag: TagType) => `/tag/${tag.id}` : undefined}
      />
    </div>
  );
};

export { Tags };

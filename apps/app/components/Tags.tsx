import type { NextPage } from "next";
import { useMemo } from "react";
import useTranslation from "next-translate/useTranslation";
import { globalSettings } from "@app/config/globalSettings";
import { TanstackTable } from "@app/components/TanstackTable";
import { TagType } from "@app/types/tag";
import { createColumnHelper } from "@tanstack/react-table";
import Address from "@app/components/Address";

type Props = {
  title?: string;
  pageSize?: number;
  tags: TagType[];
  columnsConfig: any[];
  rowLink: boolean;
  pageIndex?: number;
  setPageIndex?: (index: number) => void;
  hasNextPage?: boolean;
};

const Tags: NextPage<Props> = ({
  title,
  tags,
  pageSize = globalSettings["DEFAULT_PAGESIZE"],
  columnsConfig,
  rowLink,
  pageIndex,
  setPageIndex,
  hasNextPage,
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
            if (column.formatter) {
              return column.formatter(info.getValue(), tag);
            }
            if (typeof info.getValue() === "object" && info.getValue() !== null && "id" in info.getValue()) {
              const value = info.getValue() as { id: string; ens?: string };
              return <Address address={value.id} ens={value.ens} />;
            }
            return info.getValue();
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
        hasNextPage={hasNextPage}
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

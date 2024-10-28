// components/TanstackTable.tsx
import { Button } from "@app/components/Button";
import { globalSettings } from "@app/config/globalSettings";
import { useModal } from "@app/hooks/useModalContext";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import React, { type ReactNode, useMemo } from "react";

interface TableProps<TData> {
  columns: any[];
  data?: TData[];
  loading: boolean;
  rowsPerPage?: number;
  title?: ReactNode;
  rowLink?: (data: TData) => string | undefined;
  hasNextPage?: boolean;
  pageIndex?: number;
  setPageIndex?: (pageIndex: number) => void;
}

const TanstackTable = <TData extends object>({
  columns,
  data = [],
  loading,
  rowsPerPage = globalSettings.DEFAULT_PAGESIZE,
  title,
  rowLink,
  hasNextPage,
  pageIndex = 0,
  setPageIndex,
}: TableProps<TData>) => {
  const { t } = useTranslation("common");
  const { isModalOpen } = useModal();

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: {
        pageIndex,
        pageSize: rowsPerPage,
      },
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const router = useRouter();

  const nextPage = () => {
    setPageIndex?.(pageIndex + 1);
  };

  const prevPage = () => {
    setPageIndex?.(pageIndex - 1);
  };

  // Create skeleton rows for loading state
  const loadingRows = useMemo(
    () =>
      [...Array(rowsPerPage)].map((_, rowIndex) => (
        <tr key={`loading-row-${rowIndex}`} className="opacity-0 animate-fadeIn">
          {[...Array(columns.length)].map((_, colIndex) => (
            <td key={`loading-cell-${rowIndex}-${colIndex}`}>
              <div className="w-full h-6 rounded bg-gray-200 animate-pulse" />
            </td>
          ))}
        </tr>
      )),
    [rowsPerPage, columns.length],
  );

  // Memoize the content rows
  const contentRows = useMemo(
    () =>
      table.getRowModel().rows.map((row, rowIndex) => (
        <tr
          key={`table-row-${row.id}-${rowIndex}`}
          className={`${rowLink && !isModalOpen ? "hover:bg-base-200 cursor-pointer" : ""} opacity-0 animate-fadeIn`}
          onClick={() => rowLink && !isModalOpen && router.push(String(rowLink(row.original)))}
          onKeyUp={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              rowLink && !isModalOpen && router.push(String(rowLink(row.original)));
            }
          }}
          tabIndex={0}
        >
          {row.getVisibleCells().map((cell, cellIndex) => (
            <td key={`table-cell-${cell.id}-${cellIndex}`}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      )),
    [rowLink, isModalOpen, router, table.getRowModel],
  );

  return (
    <div className="col-span-12">
      {title && <h2 className="text-2xl font-bold pb-4">{title}</h2>}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="table bg-white">
          <thead>
            {table.getHeaderGroups().map((headerGroup, index) => (
              <tr key={`header-group-${headerGroup.id}-${index}`}>
                {headerGroup.headers.map((header, index) => (
                  <th key={`header-${header.id}-${index}`}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>{loading ? loadingRows : contentRows}</tbody>
        </table>
      </div>
      {setPageIndex && (
        <div className="flex justify-between mt-2 py-2">
          <Button className="btn-sm" disabled={pageIndex === 0} onClick={prevPage}>
            {t("prev")}
          </Button>
          <Button className="btn-sm" disabled={!hasNextPage} onClick={nextPage}>
            {t("next")}
          </Button>
        </div>
      )}
    </div>
  );
};

export { TanstackTable };

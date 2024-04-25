import React, { createContext, useContext, ReactNode, useState, useEffect, Children, ReactElement } from "react";
import { getChildrenByType, removeChildrenByType } from "react-nanny";
import Link from "next/link";
import { CopyAndPaste } from "@app/components/CopyAndPaste";
import { Truncate } from "@app/components/Truncate";
import { classNames } from "@app/utils/classNames";

interface TableContext {
  tableLoading: boolean;
  setTableLoading: (loading: boolean) => void;
  columnCount: number;
  setColumnCount: (count: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (rows: number) => void;
}
interface CellProps {
  value?: string;
  url?: string;
  copyAndPaste?: boolean;
  right?: boolean;
  truncate?: boolean;
  children?: ReactNode; // Accept children as part of the props
}

const TableContext = createContext<TableContext>({
  tableLoading: false,
  setTableLoading: () => {},
  columnCount: 0,
  setColumnCount: () => {},
  rowsPerPage: 0,
  setRowsPerPage: () => {},
});

function useTableContext(component: string) {
  let context = useContext(TableContext);

  if (context === null) {
    let error = new Error(`<${component} /> is missing a parent <Table /> component.`);
    if (Error.captureStackTrace) Error.captureStackTrace(error, useTableContext);
    throw error;
  }

  return context;
}

interface Table {
  children: ReactNode;
  className?: string;
  loading: boolean;
  rows: number;
}

const Table = ({ children, className, loading, rows }: Table) => {
  const [tableLoading, setTableLoading] = useState<boolean>(loading);
  const [columnCount, setColumnCount] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);

  useEffect(() => {
    setRowsPerPage(rows);
  }, [rows]);

  useEffect(() => {
    setTableLoading(loading);
  }, [loading]);

  const value = {
    tableLoading,
    setTableLoading,
    columnCount,
    setColumnCount,
    rowsPerPage,
    setRowsPerPage,
  };

  // Get the Title component so we can move it to where we want it
  const title = getChildrenByType(children, [Title]);
  children = removeChildrenByType(children, [Title]);

  /*   const tableClasses = classNames(
    "table grid items-center min-w-full border-separate",
    columnCount === 2 && "grid-cols-2",
    columnCount === 3 && "grid-cols-3",
    columnCount === 4 && "grid-cols-4",
    columnCount === 5 && "grid-cols-5",
    columnCount === 6 && "grid-cols-6",
  ); */

  const tableClasses = classNames("table rounded-md bg-white shadow-lg shadow-slate-400/20 ring-1 ring-slate-200");

  /*   const containerClasses = classNames(
    "-mx-4 shadow-lg lg:rounded-md lg:mx-0 ring-1 ring-slate-200 ring-opacity-100 shadow-slate-300/20",
    className,
  ); */

  const containerClasses = classNames("");

  return (
    <TableContext.Provider value={value}>
      {title}
      <table className={tableClasses}>{children}</table>
    </TableContext.Provider>
  );
};

const Title = ({ children }: { children: ReactNode }) => {
  const {} = useTableContext("Table.Title");
  return <h2 className="py-3 px-2 font-medium text-left">{children}</h2>;
};

const Head = ({ children }: { children: ReactElement }) => {
  const { columnCount, setColumnCount } = useTableContext("Table.Head");

  useEffect(() => {
    setColumnCount(Children.count(children.props.children));
  }, [setColumnCount, children]);

  const theadClasses = classNames("");

  /*   const theadClasses = classNames(
    "z-[1] col-span-full grid min-w-fit",
    columnCount === 2 && "grid-cols-2",
    columnCount === 3 && "grid-cols-3",
    columnCount === 4 && "grid-cols-4",
    columnCount === 5 && "grid-cols-5",
    columnCount === 6 && "grid-cols-6",
  ); */

  return <thead className={theadClasses}>{children}</thead>;
};

const Footer = ({ children }: { children: ReactNode }) => {
  const {} = useTableContext("Table.Footer");
  return <tfoot className="p-4 border-y">{children}</tfoot>;
};

const Body = ({ children }: { children: ReactNode }) => {
  const { tableLoading, columnCount, rowsPerPage } = useTableContext("Table.Body");

  // Display a bunch of loading rows and columns if the table is
  // loading based on the pagination amount and column count
  if (tableLoading)
    return (
      <tbody className="contents">
        {[...Array(rowsPerPage)].map((item, index) => {
          return (
            <Tr key={`loading-tr-${index}`}>
              {[...Array(columnCount)].map((item, index) => {
                return (
                  <Td key={`loading-td-${index}`}>
                    <div className="w-full h-6 rounded"></div>
                  </Td>
                );
              })}
            </Tr>
          );
        })}
      </tbody>
    );

  return <tbody className="contents">{children}</tbody>;
};

const Th = ({ children }: { children: ReactNode }) => {
  const {} = useTableContext("Table.Th");
  return <th className="text-sm font-semibold">{children}</th>;
};

const Td = ({ children }: { children: ReactNode }) => {
  const {} = useTableContext("Table.Td");
  return <td>{children}</td>;
};

const Tr = ({ children }: { children: ReactNode }) => {
  const {} = useTableContext("Table.Row");

  // Use a state variable to track whether the row is even or odd
  return <tr className="hover:bg-base-200">{children}</tr>;
};

const CellLink = ({ value, url }: { value: string; url: string }) => {
  return (
    <Link href={url} legacyBehavior>
      {value}
    </Link>
  );
};

const Cell = ({ value = "", url, copyAndPaste = false, right = false, truncate = false, children }: CellProps) => {
  const {} = useTableContext("Table.Cell");

  // Truncate value if needed
  let displayValue = truncate ? Truncate(value) : value;

  // Create a link if URL is provided
  const content = url ? (
    <Link href={url} className="link link-primary">
      {displayValue}
    </Link>
  ) : (
    displayValue
  );

  // Add copy and paste functionality if required
  const finalContent = copyAndPaste ? (
    <>
      {content}
      <CopyAndPaste value={value} />
    </>
  ) : (
    content
  );

  return <td className={`text-sm font-semibold ${right ? "text-right" : "text-left"}`}>{children || finalContent}</td>;
};

const CellWithChildren = ({ children }: { children: ReactNode }) => {
  const {} = useTableContext("Table.CellWithChildren");
  return <Td>{children}</Td>;
};

Table.Title = Title;
Table.Head = Head;
Table.Footer = Footer;
Table.Body = Body;
Table.Tr = Tr;
Table.Th = Th;
Table.Td = Td;
Table.Cell = Cell;
Table.CellWithChildren = CellWithChildren;

export { Table };

// DivTable components adjusted for full width with Flexbox
import React, { createContext, useContext, ReactNode } from "react";
import Link from "next/link";
import { classNames } from "@app/utils/classNames";

interface DivTableProps {
  children: ReactNode;
  loading?: boolean;
}

interface DivTableRowProps {
  children: ReactNode;
  onClick?: () => void;
}

interface DivTableCellProps {
  children: ReactNode;
  isHeader?: boolean;
  flexGrow?: number; // Allows for flexible control of cell width
}

const DivTableContext = createContext({ loading: false });

const DivTable = ({ children, loading = false }: DivTableProps) => (
  <DivTableContext.Provider value={{ loading }}>
    <div className="div-table w-full overflow-x-auto">{children}</div>
  </DivTableContext.Provider>
);

const DivTableHead = ({ children }: { children: ReactNode }) => (
  <div className="div-table-head w-full flex justify-start bg-gray-100">{children}</div>
);

const DivTableBody = ({ children }: { children: ReactNode }) => {
  const { loading } = useContext(DivTableContext);
  if (loading) {
    return <div className="div-table-body-loading w-full text-center p-4">Loading...</div>;
  }
  return <div className="div-table-body w-full">{children}</div>;
};

const DivTableRow = ({ children, onClick }: DivTableRowProps) => (
  <div className="div-table-row flex w-full cursor-pointer" onClick={onClick}>
    {children}
  </div>
);

const DivTableCell = ({ children, isHeader = false, flexGrow = 1 }: DivTableCellProps) => (
  <div
    className={classNames(
      "div-table-cell p-2",
      isHeader ? "font-bold bg-gray-200" : "bg-white",
      "flex-grow",
      flexGrow > 0 && `flex-grow-${flexGrow}`,
    )}
  >
    {children}
  </div>
);

// Optional Link component for cell
const DivTableCellLink = ({ children, href }: { children: ReactNode; href: string }) => (
  <Link href={href} className="link">
    <DivTableCell>{children}</DivTableCell>
  </Link>
);

export { DivTable, DivTableHead, DivTableBody, DivTableRow, DivTableCell, DivTableCellLink };

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  Children,
  useRef,
  UIEvent,
  CSSProperties,
  ReactElement,
} from 'react';
import { getChildrenByType, removeChildrenByType } from 'react-nanny';
import Link from 'next/link';
import { CopyAndPaste } from '../components/CopyAndPaste';
import { classNames } from '../utils/classNames';
import { useWindowSize, useWindowScrollPosition } from 'rooks';
interface TableContext {
  tableLoading: boolean;
  setTableLoading: (loading: boolean) => void;
  columnCount: number;
  setColumnCount: (count: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (rows: number) => void;
  headerScrollLeft: number;
  setHeaderScrollLeft: (position: number) => void;
  tableWidth: number;
  setTableWidth: (width: number) => void;
}

const TableContext = createContext<TableContext>({
  tableLoading: false,
  setTableLoading: () => {},
  columnCount: 0,
  setColumnCount: () => {},
  rowsPerPage: 0,
  setRowsPerPage: () => {},
  headerScrollLeft: 0,
  setHeaderScrollLeft: () => {},
  tableWidth: 0,
  setTableWidth: () => {},
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

const Table = ({
  children,
  className,
  loading,
  rows,
}: Table) => {
  const [tableLoading, setTableLoading] = useState<boolean>(loading);
  const [columnCount, setColumnCount] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [headerScrollLeft, setHeaderScrollLeft] = useState<number>(0);
  const [tableWidth, setTableWidth] = useState<number>(0);

  const tableRef = useRef<HTMLTableElement>(null);

  const { innerWidth } = useWindowSize();

  useEffect(() => {
    setRowsPerPage(rows);
  }, [rows]);

  useEffect(() => {
    setTableLoading(loading);
    setTableWidth(tableRef.current!.scrollWidth);
  }, [loading, innerWidth]);

  const value = {
    tableLoading,
    setTableLoading,
    columnCount,
    setColumnCount,
    rowsPerPage,
    setRowsPerPage,
    headerScrollLeft,
    setHeaderScrollLeft,
    tableWidth,
    setTableWidth,
  };

  // Get the Title component so we can move it to where we want it
  const title = getChildrenByType(children, [Title]);
  children = removeChildrenByType(children, [Title]);

  const scrollHandler = (event: UIEvent<HTMLDivElement>) => {
    setHeaderScrollLeft(event.currentTarget.scrollLeft);
  };

  const tableClasses = classNames(
    'grid min-w-full border-separate text-slate-500',
    columnCount === 2 && 'grid-cols-2',
    columnCount === 3 && 'grid-cols-3',
    columnCount === 4 && 'grid-cols-4',
    columnCount === 5 && 'grid-cols-5',
    columnCount === 6 && 'grid-cols-6',
  );

  const containerClasses = classNames('-mx-4 shadow-lg lg:rounded-md lg:mx-0 ring-1 ring-slate-200 ring-opacity-100 shadow-slate-300/20', className);

  return (
    <TableContext.Provider value={value}>
      <div className={containerClasses}>
        {title}
        <div onScroll={scrollHandler} className="grid grid-cols-1 gap-2 overflow-x-auto">
          <table ref={tableRef} className={tableClasses}>
            {children}
          </table>
        </div>
      </div>
    </TableContext.Provider>
  );
};

const Title = ({ children }: { children: ReactNode }) => {
  const {} = useTableContext('Table.Title');
  return (
    <h2 className="px-6 py-3 font-semibold text-left col-span-full text-slate-700">{children}</h2>
  );
};

const Head = ({ children }: { children: ReactElement }) => {
  const { columnCount, setColumnCount, headerScrollLeft, tableWidth } = useTableContext('Table.Head');

  const [isSticky, setIsSticky] = useState<boolean>(false);
  const [theadStyle, setTheadStyle] = useState<CSSProperties>({});
  const [theadTop, setTheadTop] = useState<number>(0);

  const theadRef = useRef<HTMLTableSectionElement>(null);
  const theadHiddenRef = useRef<HTMLTableSectionElement>(null);

  const { innerWidth } = useWindowSize();
  const { scrollY } = useWindowScrollPosition();

  useEffect(() => {
    setTheadTop(theadRef.current!.getBoundingClientRect().top);
    setColumnCount(Children.count(children.props.children));
  }, [setColumnCount, children, theadTop]);

  useEffect(() => {
    const shouldBeStyle = {
      display: isSticky ? 'grid' : 'none',
      // Adjust the sticky header to the size of the table overflow width
      width: `${tableWidth}px`,
      // Whenever we scroll left, change the translateX value so
      // we have a sticky header that follows horizontal scroll
      transform: isSticky && headerScrollLeft ? `translateX(-${headerScrollLeft}px)` : 'none',
    }

    // Compare so we aren't calling setTheadStyle every single time something happens
    if (JSON.stringify(shouldBeStyle) === JSON.stringify(theadStyle)) return;

    setTheadStyle(shouldBeStyle);
  }, [headerScrollLeft, isSticky, tableWidth, innerWidth, theadStyle]);

  useEffect(() => {
    if (Math.abs(scrollY) > Math.abs(theadTop)) {
      if (!isSticky) {
        setIsSticky(true);
      }
    } else {
      if (isSticky) {
        setIsSticky(false);
      }
    }
  }, [isSticky, scrollY, theadTop]);

  const theadClasses = classNames(
    'z-[1] col-span-full grid min-w-fit',
    columnCount === 2 && 'grid-cols-2',
    columnCount === 3 && 'grid-cols-3',
    columnCount === 4 && 'grid-cols-4',
    columnCount === 5 && 'grid-cols-5',
    columnCount === 6 && 'grid-cols-6',
  );

  return (
    <>
      <thead ref={theadRef} className={theadClasses}>
        {children}
      </thead>
      {/* The following is a duplicate that only shows when sticky header is activated */}
      <thead ref={theadHiddenRef} className={`${theadClasses} fixed top-0`} style={{ ...theadStyle }}>
        {children}
      </thead>
    </>
  );
};

const Body = ({ children }: { children: ReactNode }) => {
  const { tableLoading, columnCount, rowsPerPage } = useTableContext('Table.Body');

  // Display a bunch of loading rows and columns if the table is
  // loading based on the pagination amount and column count
  if (tableLoading) return (
    <tbody className="contents">
      {[...Array(rowsPerPage)].map((item, index) => {
        return (
          <Tr key={`loading-tr-${index}`}>
            {[...Array(columnCount)].map((item, index) => {
              return (
                <Td key={`loading-td-${index}`}>
                  <div className="w-full h-6 rounded bg-slate-100"></div>
                </Td>
              );
            })}
          </Tr>
        );
      })}
    </tbody>
  );

  return (
    <tbody className="contents">{children}</tbody>
  );
};

const Th = ({ children }: { children: ReactNode }) => {
  const {} = useTableContext('Table.Th');
  return (
    <th className="px-3 py-3.5 first:pl-6 last:pr-6 top-0 z-10 text-sm font-semibold text-left border-y whitespace-nowrap text-slate-700 bg-slate-50/75 border-slate-200 backdrop-blur backdrop-filter">{children}</th>
  );
};

const Td = ({ children }: { children: ReactNode }) => {
  const {} = useTableContext('Table.Td');
  return (
    <td className="py-3.5 px-3 first:pl-6 last:pr-6">{children}</td>
  );
};

const Tr = ({ children }: { children: ReactNode }) => {
  const {} = useTableContext('Table.Row');
  return (
    <tr className="contents">{children}</tr>
  )
};

const CellLink = ({ value, url }: { value: string, url: string }) => {
  return (
    <Link href={url}>
      <a className="text-pink-600 hover:text-pink-700">{value}</a>
    </Link>
  );
}

const Cell = ({ value, url, copyAndPaste, right }: { value: string, url?: string, copyAndPaste?: boolean, right?: boolean }) => {
  const {} = useTableContext('Table.Cell');
  return (
    <Td>
      <div className="flex space-x-1">
        <div className={classNames(
          'overflow-hidden text-ellipsis whitespace-nowrap',
          url ? 'text-pink-600 hover:text-pink-700' : '',
          right && 'text-right',
        )}>
          {url ? <CellLink value={value} url={url} /> : value}
        </div>
        {copyAndPaste && <CopyAndPaste value={value} />}
      </div>
    </Td>
  );
};

const CellWithChildren = ({ children }: { children: ReactNode }) => {
  const {} = useTableContext('Table.CellWithChildren');
  return (
    <Td>{children}</Td>
  );
};

Table.Title = Title;
Table.Head = Head;
Table.Body = Body;
Table.Tr = Tr;
Table.Th = Th;
Table.Td = Td;
Table.Cell = Cell;
Table.CellWithChildren = CellWithChildren;

export { Table };

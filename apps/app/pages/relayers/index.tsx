import useTranslation from "next-translate/useTranslation";
import { globalSettings } from "@app/config/globalSettings";
import { useRelayers } from "@app/hooks/useRelayers";
import { RelayerProvider } from "@app/context/RelayerContext";
import Layout from "@app/layouts/default";
import { TimeAgo } from "@app/components/TimeAgo";
import { Modal } from "@app/components/Modal";
import { Truncate } from "@app/components/Truncate";
import { ConnectButtonETS } from "@app/components/ConnectButtonETS";
import { useAccount } from "wagmi";
import TransactionFlowWrapper from "@app/components/transaction/TransactionFlowWrapper";
import { TransactionType } from "@app/types/transaction";
import { v4 as uuidv4 } from "uuid";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@app/components/Button";
import { NextPage } from "next";
import {
  useReactTable,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
} from "@tanstack/react-table";

const pageSize = 20;

const Relayers: NextPage = () => {
  const [skip, setSkip] = useState(0);
  const { t } = useTranslation("common");
  const { isConnected } = useAccount();
  const [transactionId, setTransactionId] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setTransactionId(uuidv4());
  }, []);

  const { relayers, nextRelayers, mutate } = useRelayers({
    pageSize,
    skip,
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 1000,
    },
  });

  const pageSizeSet = pageSize === undefined ? globalSettings["DEFAULT_PAGESIZE"] : pageSize;

  const nextPage = () => {
    setSkip(skip + pageSizeSet);
    mutate();
  };

  const prevPage = () => {
    setSkip(skip - pageSizeSet);
    mutate();
  };

  const showPrevNext = () => {
    return (nextRelayers && nextRelayers.length > 0) || (skip && skip !== 0) ? true : false;
  };

  const columnHelper = createColumnHelper(); // Create Tanstack column helper

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: t("name"),
        cell: (info) => <a href={`/relayers/${info.getValue()}`}>{info.getValue()}</a>,
      }),
      columnHelper.accessor("firstSeen", {
        header: t("created"),
        cell: (info) => <TimeAgo date={parseInt(info.getValue()) * 1000} />,
      }),
      columnHelper.accessor("owner", {
        header: t("owner"),
        cell: (info) => Truncate(info.getValue(), 14, "middle"),
      }),
      columnHelper.accessor("taggingRecordsPublished", {
        header: t("tagging-records"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("tagsPublished", {
        header: t("tags"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("pausedByOwner", {
        header: t("status"),
        cell: (info) => (info.getValue() ? t("disabled") : t("enabled")),
      }),
    ],
    [t],
  );

  const table = useReactTable({
    data: relayers || [],
    columns: columns as ColumnDef<unknown, any>[],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (!relayers) {
    return <p>Loading...</p>;
  }

  return (
    <Layout>
      <RelayerProvider>
        <div className="col-span-12">
          {isClient && !isConnected ? (
            <ConnectButtonETS className="btn-outline" />
          ) : (
            <Modal id={`create-relayer`} label={t("create-relayer")} buttonClasses="btn-primary btn-outline">
              <TransactionFlowWrapper id={transactionId} transactionType={TransactionType.AddRelayer} />
            </Modal>
          )}
        </div>
        <div className="col-span-12">
          {relayers ? (
            <>
              <table className="table table-zebra">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {showPrevNext() && (
                <div className="flex justify-between">
                  <Button disabled={skip === 0} onClick={prevPage}>
                    <svg className="relative inline-flex w-6 h-6 mr-2 -ml-1" fill="none" viewBox="0 0 24 24">
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10.25 6.75L4.75 12L10.25 17.25"
                      ></path>
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19.25 12H5"
                      ></path>
                    </svg>
                    {t("prev")}
                  </Button>
                  <Button disabled={nextRelayers && nextRelayers.length === 0} onClick={nextPage}>
                    {t("next")}
                    <svg className="relative inline-flex w-6 h-6 ml-2 -mr-1" fill="none" viewBox="0 0 24 24">
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.75 6.75L19.25 12L13.75 17.25"
                      ></path>
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 12H4.75"
                      ></path>
                    </svg>
                    {t("next")}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </RelayerProvider>
    </Layout>
  );
};

export default Relayers;

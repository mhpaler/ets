import useTranslation from "next-translate/useTranslation";
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
import { NextPage } from "next";
import { createColumnHelper } from "@tanstack/react-table";
import { TanstackTable } from "@app/components/TanstackTable";
import Link from "next/link";
import { RelayerType } from "@app/types/relayer";

const pageSize = 20;

const Relayers: NextPage = () => {
  const { t } = useTranslation("common");
  const [pageIndex, setPageIndex] = useState(0);
  const { isConnected } = useAccount();
  const [transactionId, setTransactionId] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setTransactionId(uuidv4());
  }, []);

  const { relayers = [], nextRelayers } = useRelayers({
    pageSize,
    skip: pageIndex * pageSize,
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 1000,
    },
  });

  console.log("relayers", relayers);

  const columnHelper = createColumnHelper<RelayerType>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => t("name"),
        cell: (info) => {
          const relayer = info.row.original as RelayerType;
          return (
            <Link href={`/explore/relayers/${relayer.id}`} className="link link-primary">
              {info.getValue()}
            </Link>
          );
        },
      }),
      columnHelper.accessor("firstSeen", {
        header: () => t("created"),
        cell: (info) => <TimeAgo date={info.getValue() * 1000} />,
      }),
      columnHelper.accessor("owner", {
        header: () => t("owner"),
        cell: (info) => {
          const owner = info.getValue();
          const displayValue = owner.ens ?? owner.id;
          return Truncate(displayValue, 14, "middle");
        },
      }),
      columnHelper.accessor("taggingRecordsPublished", {
        header: () => t("tagging-records"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("tagsPublished", {
        header: () => t("tags"),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("pausedByOwner", {
        header: () => t("status"),
        cell: (info) => (info.getValue() ? t("disabled") : t("enabled")),
      }),
    ],
    [t],
  );

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
        <TanstackTable
          columns={columns}
          data={relayers || []}
          loading={!relayers?.length}
          rowsPerPage={pageSize}
          hasNextPage={!!nextRelayers?.length}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
        />
      </RelayerProvider>
    </Layout>
  );
};

export default Relayers;

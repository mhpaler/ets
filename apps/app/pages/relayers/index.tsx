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
import { NextPage } from "next";
import { createColumnHelper } from "@tanstack/react-table";
import { TanstackTable } from "@app/components/TanstackTable";

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

  const columnHelper = createColumnHelper(); // Create Tanstack column helper

  const columns = useMemo<any[]>(
    () => [
      columnHelper.accessor("name", {
        header: t("name"),
        cell: (info) => {
          const relayer = info.row.original as any;
          return <a href={`/relayers/${relayer.id}`}>{info.getValue()}</a>;
        },
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
          <TanstackTable
            columns={columns}
            data={relayers}
            loading={!relayers?.length}
            rowsPerPage={pageSize}
            totalItems={relayers?.length}
            title={t("relayers")}
          />
        </div>
      </RelayerProvider>
    </Layout>
  );
};

export default Relayers;

import Address from "@app/components/Address";
import { ConnectButtonETS } from "@app/components/ConnectButtonETS";
import { Modal } from "@app/components/Modal";
import { TanstackTable } from "@app/components/TanstackTable";
import { TimeAgo } from "@app/components/TimeAgo";
import { URI } from "@app/components/URI";
import TransactionFlowWrapper from "@app/components/transaction/TransactionFlowWrapper";
import { getExplorerUrl } from "@app/config/wagmiConfig";
import { RelayerProvider } from "@app/context/RelayerContext";
import { useCurrentChain } from "@app/hooks/useCurrentChain";
import { useRelayers } from "@app/hooks/useRelayers";
import Layout from "@app/layouts/default";
import type { RelayerType } from "@app/types/relayer";
import { TransactionType } from "@app/types/transaction";
import { toEth } from "@app/utils";
import { createColumnHelper } from "@tanstack/react-table";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAccount } from "wagmi";

const pageSize = 20;

const Relayers: NextPage = () => {
  const { t } = useTranslation("common");
  const [pageIndex, setPageIndex] = useState(0);
  const { isConnected } = useAccount();
  const chain = useCurrentChain();
  const chainId = chain?.id;
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
      refreshInterval: 0,
    },
  });

  console.info("relayers", relayers);

  const columnHelper = createColumnHelper<RelayerType>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => t("name"),
        cell: (info) => {
          const relayer = info.row.original as RelayerType;
          return (
            <div className="flex items-center">
              <Link href={`/explore/relayers/${relayer.id}`} className="link link-primary">
                {info.getValue()}
              </Link>
              <URI value={getExplorerUrl({ chainId, type: "address", hash: info.row.original.id })} />
            </div>
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
          return (
            <Link href={`/explore/owners/${owner.id}`} className="link link-primary">
              <Address address={owner.id} ens={owner.ens} />
            </Link>
          );
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
      columnHelper.accessor(
        (row) => Number(row.publishedTagsAuctionRevenue) + Number(row.publishedTagsTaggingFeeRevenue),
        {
          id: "totalRevenue",
          header: () => t("revenue"),
          cell: (info) => (
            <div>
              {toEth(info.getValue(), 8)} {chain?.nativeCurrency.symbol}
            </div>
          ),
        },
      ),
      columnHelper.accessor("pausedByOwner", {
        header: () => t("status"),
        cell: (info) => (info.getValue() ? t("disabled") : t("enabled")),
      }),
    ],
    [t, columnHelper.accessor, chainId, chain],
  );

  return (
    <Layout>
      <RelayerProvider>
        <div className="col-span-12">
          {isClient && !isConnected ? (
            <ConnectButtonETS className="btn-outline" />
          ) : (
            <Modal id={"create-relayer"} label={t("create-relayer")} buttonClasses="btn-primary btn-outline">
              <TransactionFlowWrapper id={transactionId} transactionType={TransactionType.AddRelayer} />
            </Modal>
          )}
        </div>
        <TanstackTable
          columns={columns}
          data={relayers}
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

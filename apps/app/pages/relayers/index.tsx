import { useState, useMemo } from "react";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import { globalSettings } from "@app/config/globalSettings";
import useNumberFormatter from "@app/hooks/useNumberFormatter";
import { useRelayers } from "@app/hooks/useRelayers";
import { AddRelayerProvider } from "@app/context/AddRelayerContext";
import Layout from "@app/layouts/default";
import { TimeAgo } from "@app/components/TimeAgo";
import { Table } from "@app/components/Table";
import { Button } from "@app/components/Button";
import { Modal } from "@app/components/Modal";
import FormWrapper from "@app/components/addRelayer/FormWrapper";

import { ConnectButtonETS } from "@app/components/ConnectButtonETS";
import { useAccount } from "wagmi"; // Import useAccount hook
import TransactionFlowWrapper from "@app/components/transaction/TransactionFlowWrapper";
import { TransactionType } from "@app/types/transaction";

const pageSize = 20;

const Relayers: NextPage = () => {
  const [skip, setSkip] = useState(0);
  const { t } = useTranslation("common");
  const { isConnected } = useAccount();
  let content;

  if (!isConnected) {
    // If user is not connected, show the Connect button
    content = <ConnectButtonETS className="btn-outline btn-block" />;
  } else {
    // Auction hasn't started or is ongoing and user is connected
    content = (
      <Modal label={t("create-relayer")} buttonClasses="btn-primary btn-outline btn-block">
        <TransactionFlowWrapper transactionType={TransactionType.AddRelayer} />
      </Modal>
    );
  }

  const { number } = useNumberFormatter();
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

  const columns = useMemo(() => [t("name"), t("created"), t("tagging-records"), t("tags"), t("status")], [t]);

  return (
    <Layout>
      <div className="col-span-12">{content}</div>
      <div className="col-span-12">
        <Table loading={!relayers} rows={pageSize}>
          <Table.Head>
            <Table.Tr>{columns && columns.map((column) => <Table.Th key={column}>{column}</Table.Th>)}</Table.Tr>
          </Table.Head>
          <Table.Body>
            {relayers &&
              relayers.map((relayer: any) => (
                <Table.Tr key={relayer.id}>
                  <Table.Cell value={relayer.name} url={`/relayers/${relayer.id}`} />
                  <Table.CellWithChildren>
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                      <TimeAgo date={relayer.firstSeen * 1000} />
                    </div>
                  </Table.CellWithChildren>
                  <Table.Cell value={number(parseInt(relayer.taggingRecordsPublished))} />
                  <Table.Cell value={number(parseInt(relayer.tagsPublished))} />
                  <Table.Cell
                    value={
                      (relayers && relayers[0].pausedByOwner) || (relayers && relayers[0].lockedByProtocol)
                        ? t("disabled")
                        : t("enabled")
                    }
                  />
                </Table.Tr>
              ))}
          </Table.Body>
          {showPrevNext() && (
            <Table.Footer>
              <tr>
                <td className="flex justify-between">
                  <Button disabled={skip === 0} onClick={() => prevPage()}>
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
                  <Button disabled={nextRelayers && nextRelayers.length === 0} onClick={() => nextPage()}>
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
                  </Button>
                </td>
              </tr>
            </Table.Footer>
          )}
        </Table>
      </div>
    </Layout>
  );
};

export default Relayers;

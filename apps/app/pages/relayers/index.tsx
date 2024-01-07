import { useState, useMemo } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import { settings } from "@app/constants/settings";
import useNumberFormatter from "@app/hooks/useNumberFormatter";
import { useRelayers } from "@app/hooks/useRelayers";
import PageTitle from "@app/components/PageTitle";
import { TimeAgo } from "@app/components/TimeAgo";
import { Table } from "@app/components/Table";
import { Button } from "@app/components/Button";
import { Modal } from "@app/components/Modal";
import FormWrapper from "@app/components/modals/addRelayer/FormWrapper";
import { AddRelayerProvider } from "@app/context/AddRelayerContext";
//import { CreateRelayerModal } from "../../transaction-flow/input/createRelayerModal";

const pageSize = 20;

const Relayers: NextPage = () => {
  const [skip, setSkip] = useState(0);
  const { t } = useTranslation("common");
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

  const pageSizeSet = pageSize === undefined ? settings["DEFAULT_PAGESIZE"] : pageSize;

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

  const pageTitle = `${t("relayers")}`;
  const browserTitle = `${pageTitle} | ETS`;

  return (
    <div className="max-w-7xl mx-auto mt-12">
      <Head>
        <title>{browserTitle}</title>
      </Head>
      <div className="flex justify-between">
        <PageTitle title={pageTitle} />
        {/*         <AddRelayerProvider>
          <Modal buttonText={t("create-relayer")}>
            <FormWrapper />
          </Modal>
        </AddRelayerProvider> */}
      </div>
      <Table loading={!relayers} rows={pageSize}>
        <Table.Title>{t("relayers")}</Table.Title>
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
                <Table.Cell value={number(parseInt(relayer.tagsPublished))} right />
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
  );
};

export default Relayers;

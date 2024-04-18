import { useState, useMemo } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { globalSettings } from "@app/config/globalSettings";
import { timestampToString } from "@app/utils";
import { toEth } from "@app/utils";
import useNumberFormatter from "@app/hooks/useNumberFormatter";
import { useCreators } from "@app/hooks/useCreators";
import Layout from "@app/layouts/default";
import { Table } from "@app/components/Table";
import { Button } from "@app/components/Button";
import { Truncate } from "@app/components/Truncate";

const pageSize = 20;

const Creators: NextPage = () => {
  const [skip, setSkip] = useState(0);
  const { query } = useRouter();
  const { t } = useTranslation("common");
  const { number } = useNumberFormatter();
  const { creators, nextCreators, mutate } = useCreators({
    pageSize,
    skip,
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
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
    return (nextCreators && nextCreators.length > 0) || (skip && skip !== 0) ? true : false;
  };

  const columns = useMemo(() => [t("creator"), t("first-seen"), t("tags-created"), t("revenue")], [t]);

  const pageTitle = `Tag ${t("creators")}`;
  const browserTitle = `${pageTitle} | ETS`;

  return (
    <Layout>
      <div className="col-span-12">
        <Table loading={!creators} rows={pageSize}>
          <Table.Head>
            <Table.Tr>{columns && columns.map((column) => <Table.Th key={column}>{column}</Table.Th>)}</Table.Tr>
          </Table.Head>
          <Table.Body>
            {creators &&
              creators.map((creator: any) => (
                <Table.Tr key={creator.id}>
                  <Table.Cell value={Truncate(creator.id)} url={`/creators/${creator.id}`} copyAndPaste />
                  <Table.Cell value={creators && timestampToString(parseInt(creators[0].firstSeen))} />
                  <Table.Cell value={number(parseInt(creator.tagsCreated))} />
                  <Table.Cell
                    value={`${toEth(
                      creator.createdTagsAuctionRevenue + creator.createdTagsTaggingFeeRevenue,
                      4,
                    )} MATIC`}
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
                  <Button disabled={nextCreators && nextCreators.length === 0} onClick={() => nextPage()}>
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

export default Creators;

import { useState, useMemo } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { settings } from "../../constants/settings";
import { useTaggers } from "../../hooks/useTaggers";
import { Table } from "../../components/Table";
import { Button } from "../../components/Button";
import useNumberFormatter from "../../hooks/useNumberFormatter";
import PageTitle from "../../components/PageTitle";

const pageSize = 20;

const Creators: NextPage = () => {
  const [skip, setSkip] = useState(0);
  const { query } = useRouter();
  const { tag } = query;
  const { t } = useTranslation("common");
  const { number } = useNumberFormatter();
  const { taggers, nextTaggers, mutate } = useTaggers({
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

  const pageSizeSet =
    pageSize === undefined ? settings["DEFAULT_PAGESIZE"] : pageSize;

  const nextPage = () => {
    setSkip(skip + pageSizeSet);
    mutate();
  };

  const prevPage = () => {
    setSkip(skip - pageSizeSet);
    mutate();
  };

  const showPrevNext = () => {
    return (nextTaggers && nextTaggers.length > 0) || (skip && skip !== 0)
      ? true
      : false;
  };

  const columns = useMemo(() => [t("tagger"), t("tagging-records")], [t]);
  const pageTitle = `${t("taggers")}`;
  const browserTitle = `${pageTitle} | ETS`;

  return (
    <div className="max-w-6xl mx-auto mt-12">
      <Head>
        <title>{browserTitle}</title>
      </Head>

      <PageTitle title={pageTitle} />

      <Table loading={!taggers} rows={pageSize}>
        <Table.Head>
          <Table.Tr>
            {columns &&
              columns.map((column) => (
                <Table.Th key={column}>{column}</Table.Th>
              ))}
          </Table.Tr>
        </Table.Head>
        <Table.Body>
          {taggers &&
            taggers.map((tagger: any) => (
              <Table.Tr key={tagger.id}>
                <Table.Cell
                  value={tagger.id}
                  url={`/taggers/${tagger.id}`}
                  copyAndPaste
                />
                <Table.Cell
                  value={number(parseInt(tagger.taggingRecordsCreated))}
                  right
                />
              </Table.Tr>
            ))}
        </Table.Body>
        {showPrevNext() && (
          <Table.Footer>
            <tr>
              <td className="flex justify-between">
                <Button disabled={skip === 0} onClick={() => prevPage()}>
                  <svg
                    className="relative inline-flex w-6 h-6 mr-2 -ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
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
                <Button
                  disabled={nextTaggers && nextTaggers.length === 0}
                  onClick={() => nextPage()}
                >
                  {t("next")}
                  <svg
                    className="relative inline-flex w-6 h-6 ml-2 -mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
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

export default Creators;

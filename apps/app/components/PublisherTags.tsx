import { useState, useMemo, Suspense } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { usePublisherTags } from "../hooks/usePublisherTags";
import { TimeAgo } from "../components/TimeAgo";
import { Table } from "../components/Table";
import { Button } from "../components/Button";

const pageSize = 20;

const PublisherTags: NextPage = () => {
  const { query } = useRouter();
  const { publisher } = query;
  const [skip, setSkip] = useState(0);
  const { t } = useTranslation("common");

  const variables = {
    publisherId: publisher,
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
  };

  const { publisherTags, nextPublisherTags, mutate } =
    usePublisherTags(variables);

  const chainName: { [key: number]: string } = {
    1: "Ethereum",
    80001: "Polygon Mumbai",
  };

  const nextPage = () => {
    setSkip(skip + 20);
    mutate();
  };

  const prevPage = () => {
    setSkip(skip - 20);
    mutate();
  };

  const columns = useMemo(
    () => [
      t("ctag"),
      t("tagging-records"),
      t("created"),
      t("creator"),
      t("owner"),
    ],
    [t]
  );

  return (
    <div className="max-w-6xl mx-auto mt-12">
      <Head>
        <title>{t("ctags")} publisher by | Ethereum Tag Service</title>
      </Head>

      <Table loading={!publisherTags} rows={pageSize}>
        <Table.Title>{t("ctags")}</Table.Title>
        <Table.Head>
          <Table.Tr>
            {columns &&
              columns.map((column) => (
                <Table.Th key={column}>{column}</Table.Th>
              ))}
          </Table.Tr>
        </Table.Head>
        <Table.Body>
          {publisherTags &&
            publisherTags.map((tag: any) => (
              <Table.Tr key={tag.machineName}>
                <Table.CellWithChildren>
                  <Link href={`/tags/${tag.machineName}`}>
                    <a className="text-pink-600 hover:text-pink-700">
                      {tag.display}
                    </a>
                  </Link>
                </Table.CellWithChildren>
                <Table.Cell value={tag.tagAppliedInTaggingRecord} />
                <Table.CellWithChildren>
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                    <TimeAgo date={tag.timestamp * 1000} />
                  </div>
                </Table.CellWithChildren>

                <Table.Cell value={tag.creator.id} copyAndPaste />
                <Table.Cell value={tag.owner.id} copyAndPaste />
              </Table.Tr>
            ))}
        </Table.Body>
      </Table>

      <div className="flex justify-between mt-8">
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
          Prev
        </Button>
        <Button
          disabled={nextPublisherTags && nextPublisherTags.length === 0}
          onClick={() => nextPage()}
        >
          Next
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
      </div>
    </div>
  );
};

export { PublisherTags };

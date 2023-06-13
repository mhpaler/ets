import { useState, useMemo } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { settings } from "../constants/settings";
import { useTaggingRecords } from "../hooks/useTaggingRecords";
import { TimeAgo } from "./TimeAgo";
import { Table } from "./Table";
import { Button } from "./Button";
import { Tag } from "./Tag";

type Props = {
  filter?: any;
  pageSize?: number;
  orderBy?: string;
  title?: string;
};

// { relayer_: { id: relayer } },

const TaggingRecords: NextPage<Props> = ({
  filter,
  pageSize,
  orderBy,
  title,
}) => {
  const { t } = useTranslation("common");
  const [skip, setSkip] = useState(0);
  const { taggingRecords, nextTaggingRecords, mutate } = useTaggingRecords({
    filter: filter,
    pageSize: pageSize,
    orderBy: orderBy,
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
    return (nextTaggingRecords && nextTaggingRecords.length > 0) ||
      (skip && skip !== 0)
      ? true
      : false;
  };

  const columns = useMemo(
    () => [
      t("id"),
      t("created"),
      t("relayer"),
      t("record-type"),
      t("target"),
      t("tags"),
    ],
    [t]
  );

  return (
    <div className="max-w-6xl mx-auto">
      <Head>
        <title>{t("recently-tagged")} | Ethereum Tag Service</title>
      </Head>

      <Table loading={!taggingRecords} rows={pageSizeSet}>
        {title && <Table.Title>{title}</Table.Title>}
        <Table.Head>
          <Table.Tr>
            {columns &&
              columns.map((column) => (
                <Table.Th key={column}>{column}</Table.Th>
              ))}
          </Table.Tr>
        </Table.Head>
        <Table.Body>
          {taggingRecords &&
            taggingRecords.map((taggingRecord: any) => (
              <Table.Tr key={taggingRecord.id}>
                <Table.Cell
                  url={"/tagging-records/" + taggingRecord.id}
                  value={taggingRecord.id}
                  truncate
                  copyAndPaste
                />
                <Table.CellWithChildren>
                  <TimeAgo date={taggingRecord.timestamp * 1000} />
                </Table.CellWithChildren>

                <Table.CellWithChildren>
                  <Link
                    href={`/relayers/${
                      taggingRecord && taggingRecord.relayer.id
                    }`}
                  >
                    <a className="text-pink-600 hover:text-pink-700">
                      {taggingRecord && taggingRecord.relayer.name}
                    </a>
                  </Link>
                </Table.CellWithChildren>

                <Table.Cell value={taggingRecord.recordType} />

                <Table.Cell
                  url={"/targets/" + taggingRecord.target.id}
                  value={taggingRecord.target.id}
                  truncate
                  copyAndPaste
                />
                <Table.CellWithChildren>
                  {taggingRecord &&
                    taggingRecord.tags.map((tag: any, i: number) => (
                      <span key={i} className="mr-2 pb-2 inline-block">
                        <Tag tag={tag} />
                      </span>
                    ))}
                </Table.CellWithChildren>
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
                  disabled={
                    nextTaggingRecords && nextTaggingRecords.length === 0
                  }
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

export { TaggingRecords };

import { useState, useMemo } from "react";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import { useCtags } from "../hooks/useCtags";
import { TimeAgo } from "./TimeAgo";
import { Table } from "./Table";
import { Button } from "./Button";
import Link from "next/link";

const pageSize = 20;
type Props = {
  filter: any;
};

const Tags: NextPage<Props> = ({ filter }) => {
  const [skip, setSkip] = useState(0);
  const { t } = useTranslation("common");

  //filter = {
  //  owner_: { id: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8" },
  //};

  const { tags, nextTags, mutate } = useCtags({
    pageSize,
    skip,
    filter: filter,
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    },
  });

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
      t("tag"),
      //t("tagging-records"),
      t("created"),
      t("relayer"),
      t("creator"),
      t("owner"),
    ],
    [t]
  );

  return (
    <div className="max-w-6xl mx-auto">
      <Table loading={!tags} rows={pageSize}>
        <Table.Head>
          <Table.Tr>
            {columns &&
              columns.map((column) => (
                <Table.Th key={column}>{column}</Table.Th>
              ))}
          </Table.Tr>
        </Table.Head>
        <Table.Body>
          {tags &&
            tags.map((tag: any) => (
              <Table.Tr key={tag.machineName}>
                <Table.CellWithChildren>
                  <Link href={`/tags/${tag.machineName}`}>
                    <a className="text-sm inline-block py-1 px-2 rounded text-pink-600 hover:text-pink-700 bg-pink-100 hover:bg-pink-200 last:mr-0 mr-1">
                      {tag.display}
                    </a>
                  </Link>
                </Table.CellWithChildren>

                <Table.CellWithChildren>
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                    <TimeAgo date={tag.timestamp * 1000} />
                  </div>
                </Table.CellWithChildren>
                <Table.Cell
                  value={tag.relayer.name}
                  url={"/relayers/" + tag.relayer.id}
                  truncate
                />
                <Table.Cell
                  value={tag.creator.id}
                  url={"/creators/" + tag.creator.id}
                  copyAndPaste
                  truncate
                />

                <Table.Cell
                  value={tag.owner.id}
                  url={"/owners/" + tag.owner.id}
                  copyAndPaste
                  truncate
                />
              </Table.Tr>
            ))}
        </Table.Body>
      </Table>

      <div className="flex justify-between mt-4">
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
          disabled={nextTags && nextTags.length === 0}
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

export { Tags };

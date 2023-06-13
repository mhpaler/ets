import { useState, useMemo } from "react";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import { useCtags } from "../hooks/useCtags";
import { settings } from "../constants/settings";
import { TimeAgo } from "./TimeAgo";
import { Table } from "./Table";
import { Button } from "./Button";
import { Tag } from "./Tag";

const pageSize = 20;
type Props = {
  filter?: any;
  pageSize?: number;
  orderBy?: string;
  title?: string;
};

const Tags: NextPage<Props> = ({ filter, pageSize, orderBy, title }) => {
  const [skip, setSkip] = useState(0);
  const { t } = useTranslation("common");

  const { tags, nextTags, mutate } = useCtags({
    pageSize,
    skip,
    orderBy,
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
    return (nextTags && nextTags.length > 0) || (skip && skip !== 0)
      ? true
      : false;
  };

  const columns = useMemo(
    () => [t("tag"), t("created"), t("relayer"), t("creator"), t("owner")],
    [t]
  );

  return (
    <div className="max-w-6xl mx-auto">
      <Table loading={!tags} rows={pageSizeSet}>
        {title ? <Table.Title>{title}</Table.Title> : ""}
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
                  <Tag tag={tag} />
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
        {showPrevNext() && (
          <Table.Footer>
            <div className="flex justify-between">
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
          </Table.Footer>
        )}
      </Table>
    </div>
  );
};

export { Tags };

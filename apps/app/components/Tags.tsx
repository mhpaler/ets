import { useState, useMemo } from "react";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import { useCtags } from "../hooks/useCtags";
import { settings } from "../constants/settings";
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
      refreshInterval: 1500,
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
    return (nextTags && nextTags.length > 0) || (skip && skip !== 0) ? true : false;
  };

  const columns = useMemo(() => [t("tag"), t("created"), t("relayer"), t("creator"), t("owner")], [t]);

  return (
    <div className="col-span-12">
      <Table loading={!tags} rows={pageSizeSet}>
        {title ? <Table.Title>{title}</Table.Title> : ""}
        <Table.Head>
          <Table.Tr>{columns && columns.map((column) => <Table.Th key={column}>{column}</Table.Th>)}</Table.Tr>
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
                <Table.Cell value={tag.relayer.name} url={"/relayers/" + tag.relayer.id} truncate />
                <Table.Cell value={tag.creator.id} url={"/creators/" + tag.creator.id} copyAndPaste truncate />

                <Table.Cell value={tag.owner.id} url={"/owners/" + tag.owner.id} copyAndPaste truncate />
              </Table.Tr>
            ))}
        </Table.Body>
        {showPrevNext() && (
          <Table.Footer>
            <Table.Tr>
              <Table.CellWithChildren>
                <div className="flex space-x-2 justify-self-center">
                  <Button className="btn btn-sm btn-primary" disabled={skip === 0} onClick={() => prevPage()}>
                    Prev
                  </Button>
                  <Button
                    className="btn btn-sm btn-primary"
                    disabled={nextTags && nextTags.length === 0}
                    onClick={() => nextPage()}
                  >
                    Next
                  </Button>
                </div>
              </Table.CellWithChildren>
            </Table.Tr>
          </Table.Footer>
        )}
      </Table>
    </div>
  );
};

export { Tags };

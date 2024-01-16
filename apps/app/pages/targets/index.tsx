import { useState, useMemo, Suspense } from "react";
import type { NextPage } from "next";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { settings } from "@app/constants/settings";
import { useTargets } from "@app/hooks/useTargets";
import Layout from "@app/layouts/default";

import { TimeAgo } from "@app/components/TimeAgo";
import { Table } from "@app/components/Table";
import { Button } from "@app/components/Button";
import { Truncate } from "@app/components/Truncate";

import { CopyAndPaste } from "@app/components/CopyAndPaste";
import { URI } from "@app/components/URI";

const pageSize = 20;

const Targets: NextPage = () => {
  const [skip, setSkip] = useState(0);
  const { t } = useTranslation("common");
  const { targets, nextTargets, mutate } = useTargets({
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
    return (nextTargets && nextTargets.length > 0) || (skip && skip !== 0) ? true : false;
  };

  const columns = useMemo(() => [t("id"), t("created"), t("URI")], [t]);

  return (
    <Layout>
      <div className="col-span-12 max-w-screen-lg">
        <Table loading={!targets} rows={pageSize}>
          <Table.Head>
            <Table.Tr>{columns && columns.map((column) => <Table.Th key={column}>{column}</Table.Th>)}</Table.Tr>
          </Table.Head>
          <Table.Body>
            {targets &&
              targets.map((target: any) => (
                <Table.Tr key={target.id}>
                  <Table.CellWithChildren>
                    <Link href={`/targets/${target && target.id}`} className="link link-primary">
                      {target && Truncate(target.id, 24, "middle")}
                    </Link>
                  </Table.CellWithChildren>
                  <Table.CellWithChildren>
                    <div className="text-ellipsis whitespace-nowrap">
                      <TimeAgo date={target.created * 1000} />
                    </div>
                  </Table.CellWithChildren>
                  <Table.CellWithChildren>
                    <div>
                      <span className="line-clamp-1">{target && target.targetURI}</span>
                      <CopyAndPaste value={target && target.targetURI} />
                      <URI value={target && target.targetURI} />
                    </div>
                  </Table.CellWithChildren>
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
                  <Button disabled={nextTargets && nextTargets.length === 0} onClick={() => nextPage()}>
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

export default Targets;

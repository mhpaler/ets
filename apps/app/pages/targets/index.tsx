import { useState, useMemo, Suspense } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { useTargets } from "../../hooks/useTargets";
import PageTitle from "../../components/PageTitle";
import { TimeAgo } from "../../components/TimeAgo";
import { Table } from "../../components/Table";
import { Button } from "../../components/Button";
import { Truncate } from "../../components/Truncate";
import { CopyAndPaste } from "../../components/CopyAndPaste";
import { URI } from "../../components/URI";

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

  const nextPage = () => {
    setSkip(skip + 20);
    mutate();
  };

  const prevPage = () => {
    setSkip(skip - 20);
    mutate();
  };

  const columns = useMemo(() => [t("id"), t("created"), t("URI")], [t]);

  return (
    <div className="max-w-6xl mx-auto mt-12">
      <Head>
        <title>{t("targets")} | Ethereum Tag Service</title>
      </Head>

      <PageTitle title={t("targets")} />

      <Table loading={!targets} rows={pageSize}>
        <Table.Head>
          <Table.Tr>
            {columns &&
              columns.map((column) => (
                <Table.Th key={column}>{column}</Table.Th>
              ))}
          </Table.Tr>
        </Table.Head>
        <Table.Body>
          {targets &&
            targets.map((target: any) => (
              <Table.Tr key={target.id}>
                <Table.CellWithChildren>
                  <Link href={`/targets/${target && target.id}`}>
                    <a className="text-pink-600 hover:text-pink-700">
                      {target && Truncate(target.id)}
                    </a>
                  </Link>
                </Table.CellWithChildren>
                <Table.CellWithChildren>
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                    <TimeAgo date={target.created * 1000} />
                  </div>
                </Table.CellWithChildren>
                <Table.CellWithChildren>
                  <div className="flex space-x-1 col-span-2 justify-start">
                    <div className="text-slate-500 truncate">
                      {target && target.targetURI}
                    </div>
                    <CopyAndPaste value={target && targets.targetURI} />
                    <URI value={target && targets.targetURI} />
                  </div>
                </Table.CellWithChildren>
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
          disabled={nextTargets && nextTargets.length === 0}
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

export default Targets;

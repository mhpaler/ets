import { useMemo, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import useSWR from "swr";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { useTaggingRecords } from "../../hooks/useTaggingRecords";
import { timestampToString } from "../../utils";
import { toDp, toEth } from "../../utils";
import { Number } from "../../components/Number";
import { Table } from "../../components/Table";
import { TimeAgo } from "../../components/TimeAgo";
import { CopyAndPaste } from "../../components/CopyAndPaste";
import { Panel } from "../../components/Panel";
import PageTitle from "../../components/PageTitle";

const TaggingRecord: NextPage = () => {
  const { query } = useRouter();
  const { taggingRecordId } = query;
  const { t } = useTranslation("common");
  const { taggingRecords } = useTaggingRecords({
    pageSize: 1,
    skip: 0,
    filter: { id: taggingRecordId },
    orderBy: "timestamp",
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    },
  });

  return (
    <div className="max-w-6xl mx-auto mt-12">
      <Head>
        <title>Tagging Record | Ethereum Tag Service</title>
      </Head>

      <PageTitle title="Tagging Record" shareUrl="https://ets.xyz" />
      <div className="grid gap-6 mx-auto mt-8 lg:mb-12 mb-6 lg:gap-12 md:space-y-0 md:grid sm:w-full md:grid-cols-1">
        <div className="grid content-start w-full gap-6 mx-auto lg:gap-12">
          <div>
            <Panel title={t("overview")}>
              <div className="grid grid-cols-3 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500 ">{t("id")}</div>
                <div className="text-slate-500 col-span-2 text-left truncate">
                  {taggingRecords && taggingRecords[0].id}
                </div>
              </div>

              <div className="grid grid-cols-3 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500 ">{t("created")}</div>
                <div className="text-slate-500 col-span-2 text-left">
                  {taggingRecords &&
                    timestampToString(parseInt(taggingRecords[0].timestamp))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("publisher")}</div>
                <div className="text-slate-500 col-span-2 text-left">
                  <Link
                    href={`/publishers/${
                      taggingRecords && taggingRecords[0].publisher.id
                    }`}
                  >
                    <a className="text-pink-600 hover:text-pink-700">
                      {taggingRecords && taggingRecords[0].publisher.name}
                    </a>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("tagger")}</div>
                <div className="text-slate-500 col-span-2 text-left truncate">
                  {taggingRecords && taggingRecords[0].tagger.id}
                  <CopyAndPaste
                    value={taggingRecords && taggingRecords[0].tagger.id}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("record-type")}</div>
                <div className="text-slate-500 col-span-2 text-left ">
                  {taggingRecords && taggingRecords[0].recordType}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("target")}</div>
                <div className="text-slate-500 col-span-2 text-left truncate">
                  {taggingRecords && taggingRecords[0].target.targetURI}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("tags")}</div>
                <div className="text-slate-500 col-span-2 text-left">
                  {taggingRecords &&
                    taggingRecords[0].tags.map((tag: any) => (
                      <ul key={tag.id}>
                        <li>
                          <Link href={`/ctags/${tag.machineName}`}>
                            <a className="text-pink-600 hover:text-pink-700">
                              {tag.display}
                            </a>
                          </Link>
                        </li>
                      </ul>
                    ))}
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaggingRecord;

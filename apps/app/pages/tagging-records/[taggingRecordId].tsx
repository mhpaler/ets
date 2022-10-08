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
  const variables = { id: taggingRecordId };
  const { t } = useTranslation("common");

  const { data } = useSWR([
    `query taggingRecords($id: String, $first: Int!, $skip: Int!, $orderBy: String!) {
      taggingRecords: taggingRecords(
        first: $first
        skip: $skip
        orderBy: $orderBy
        orderDirection: desc
        where: {id: $id}
      ) {
        id
        recordType
        timestamp
        publisher {
          id
          name
        }
        tags {
          id
          display
          machineName
        }
        target {
          targetURI
          targetType
        }
        tagger {
          id
        }
      }
    }`,
    {
      id: taggingRecordId,
      skip: 0,
      first: 1,
      orderBy: "timestamp",
    },
  ]);

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
              <div className="grid grid-cols-1 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("created")}</div>
                <div>
                  <div className="text-slate-500">
                    {data &&
                      timestampToString(
                        parseInt(data.taggingRecords[0].timestamp)
                      )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("publisher")}</div>
                <div>
                  <div className="text-slate-500 text-left">
                    {data && data.taggingRecords[0].publisher.name}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("tagger")}</div>
                <div className="text-slate-500">
                  <div className="text-slate-500 truncate">
                    {data && data.taggingRecords[0].tagger.id}
                    <CopyAndPaste
                      value={data && data.taggingRecords[0].tagger.id}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("record-type")}</div>
                <div>
                  <div className="text-slate-500 text-left">
                    {data && data.taggingRecords[0].recordType}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("target")}</div>
                <div>
                  <div className="text-slate-500 text-left truncate">
                    {data && data.taggingRecords[0].target.targetURI}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("tags")}</div>
                <div>
                  <div className="text-slate-500 text-left">
                    {data &&
                      data.taggingRecords[0].tags.map((tag: any) => (
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
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaggingRecord;

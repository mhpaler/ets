import { useMemo, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import useSWR from "swr";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { timestampToString } from "../../utils";
import { toDp, toEth } from "../../utils";
import { Tab } from "@headlessui/react";
import { PublisherTaggingRecords } from "../../components/PublisherTaggingRecords";
import { PublisherTags } from "../../components/PublisherTags";
import { Number } from "../../components/Number";
import { Table } from "../../components/Table";
import { TimeAgo } from "../../components/TimeAgo";
import { CopyAndPaste } from "../../components/CopyAndPaste";
import { Panel } from "../../components/Panel";
import PageTitle from "../../components/PageTitle";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

const Publisher: NextPage = () => {
  const { query } = useRouter();
  const { publisher } = query;
  const variables = { id: publisher };
  const { t } = useTranslation("common");

  const { data, error } = useSWR([
    `query publisher($id: String!) {
      publisher: publisher(first: 1, id: $id) {
        id
        name
        firstSeen
        creator
        owner
        pausedByOwner
        pausedByProtocol
        publishedTagsAddedToTaggingRecords
        publishedTagsAuctionRevenue
        publishedTagsRemovedFromTaggingRecords
        publishedTagsTaggingFeeRevenue
        taggingRecordTxns
        taggingRecordsPublished
        tagsApplied
        tagsPublished
        tagsRemoved
      }
    }`,
    variables,
  ]);

  const chainName: { [key: number]: string } = {
    1: "Ethereum",
    80001: "Polygon Mumbai",
  };

  const columns = useMemo(
    () => [
      "Target",
      t("ctags"),
      t("record-type"),
      t("date"),
      t("tagger"),
      t("publisher"),
    ],
    [t]
  );

  const pageSize = 20;

  return (
    <div className="max-w-6xl mx-auto mt-12">
      <Head>
        <title>{data && data.publisher.name} | Ethereum Tag Service</title>
      </Head>

      <PageTitle
        title={data && data.publisher.name}
        shareUrl="https://ets.xyz"
      />

      <div className="grid gap-6 mx-auto mt-8 lg:mb-12 mb-6 lg:gap-12 md:space-y-0 md:grid sm:w-full md:grid-cols-2">
        <div className="grid content-start w-full gap-6 mx-auto lg:gap-12">
          <div>
            <Panel title={t("overview")}>
              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("created")}</div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {data &&
                      timestampToString(parseInt(data.publisher.firstSeen))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 px-6 py-4 space-x-4 md:grid-flow-col">
                <div className="text-slate-500">{t("id")}</div>
                <div className="flex space-x-1">
                  <div className="grid flex-grow md:grid-flow-col">
                    <div className="text-slate-500 truncate ">
                      {data && data.publisher.id}
                    </div>
                  </div>
                  <CopyAndPaste value={data && data.publisher.id} />
                </div>
              </div>

              <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4">
                <div className="text-slate-500">{t("creator")}</div>
                <div className="flex space-x-1">
                  <div className="grid flex-grow md:grid-flow-col">
                    <div className="text-slate-500 truncate ">
                      {data && data.publisher.creator}
                    </div>
                  </div>
                  <CopyAndPaste value={data && data.publisher.creator} />
                </div>
              </div>

              <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4">
                <div className="flex-grow text-slate-500">{t("owner")}</div>
                <div className="flex col-span-3 space-x-1">
                  <div className="grid flex-grow grid-cols-1 md:grid-flow-col">
                    <div className="text-slate-500 truncate ">
                      {data && data.publisher.owner}
                    </div>
                  </div>
                  <CopyAndPaste value={data && data.publisher.owner} />
                </div>
              </div>
            </Panel>
          </div>
        </div>
        <div className="grid content-start w-full gap-6 mx-auto lg:gap-12">
          <div>
            <Panel title={t("stats")}>
              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("tagging-records")}</div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {data && (
                      <Number value={data.publisher.taggingRecordsPublished} />
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("ctags-published")}</div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {data && <Number value={data.publisher.tagsPublished} />}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">
                  {t("lifetime-tags-applied")}
                </div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {data && <Number value={data.publisher.tagsApplied} />}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("lifetime-revenue")}</div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {data &&
                      toDp(
                        toEth(
                          data.publisher.publishedTagsAuctionRevenue +
                            data.publisher.publishedTagsTaggingFeeRevenue
                        )
                      )}
                    &nbsp;{t("matic")}
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
      <div>
        <div>
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-md  p-px">
              <Tab
                key="taggingRecords"
                className={({ selected }) =>
                  classNames(
                    "rounded-md rounded-b-none py-3.5 px-6 font-semibold leading-5 text-slate-700",
                    selected
                      ? "border border-b-0 whitespace-nowrap text-slate-700 bg-slate-50/75 border-slate-200 backdrop-blur backdrop-filter"
                      : "text-slate-300 hover:bg-white/[0.12] hover:text-slate-400"
                  )
                }
              >
                {t("latest-tagging-records")}
              </Tab>
              <Tab
                key="tags"
                className={({ selected }) =>
                  classNames(
                    "rounded-md rounded-b-none py-3.5 px-6 font-semibold leading-5 text-slate-700",

                    selected
                      ? "border border-b-0 whitespace-nowrap text-slate-700 bg-slate-50/75 border-slate-200 backdrop-blur backdrop-filter"
                      : "text-slate-300 hover:bg-white/[0.12] hover:text-slate-400"
                  )
                }
              >
                {t("latest-ctags")}
              </Tab>
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel
                key="taggingRecords"
                className={classNames("rounded-xl bg-white")}
              >
                <PublisherTaggingRecords />
              </Tab.Panel>
              <Tab.Panel
                key="tags"
                className={classNames("rounded-xl bg-white")}
              >
                <PublisherTags />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
};

export default Publisher;

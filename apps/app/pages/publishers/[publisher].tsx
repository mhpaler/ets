import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { usePublishers } from "../../hooks/usePublishers";
import useTranslation from "next-translate/useTranslation";
import { timestampToString } from "../../utils";
import { toDp, toEth } from "../../utils";
import { Tab } from "@headlessui/react";
import { PublisherTaggingRecords } from "../../components/PublisherTaggingRecords";
import { PublisherTags } from "../../components/PublisherTags";
import { Number } from "../../components/Number";
import { CopyAndPaste } from "../../components/CopyAndPaste";
import { Panel } from "../../components/Panel";
import PageTitle from "../../components/PageTitle";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

const Publisher: NextPage = () => {
  const { query } = useRouter();
  const { publisher } = query;
  const { t } = useTranslation("common");

  const { publishers } = usePublishers({
    pageSize: 1,
    skip: 0,
    filter: { id: publisher },
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
        <title>{publishers && publishers[0].name} | Ethereum Tag Service</title>
      </Head>

      <PageTitle
        title={publishers && publishers[0].name}
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
                    {publishers &&
                      timestampToString(parseInt(publishers[0].firstSeen))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 px-6 py-4 space-x-4 md:grid-flow-col">
                <div className="text-slate-500">{t("id")}</div>
                <div className="flex space-x-1">
                  <div className="grid flex-grow md:grid-flow-col">
                    <div className="text-slate-500 truncate ">
                      {publishers && publishers[0].id}
                    </div>
                  </div>
                  <CopyAndPaste value={publishers && publishers[0].id} />
                </div>
              </div>

              <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4">
                <div className="text-slate-500">{t("creator")}</div>
                <div className="flex space-x-1">
                  <div className="grid flex-grow md:grid-flow-col">
                    <div className="text-slate-500 truncate ">
                      {publishers && publishers[0].creator}
                    </div>
                  </div>
                  <CopyAndPaste value={publishers && publishers[0].creator} />
                </div>
              </div>

              <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4">
                <div className="flex-grow text-slate-500">{t("owner")}</div>
                <div className="flex col-span-3 space-x-1">
                  <div className="grid flex-grow grid-cols-1 md:grid-flow-col">
                    <div className="text-slate-500 truncate ">
                      {publishers && publishers[0].owner}
                    </div>
                  </div>
                  <CopyAndPaste value={publishers && publishers[0].owner} />
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
                    {publishers && (
                      <Number value={publishers[0].taggingRecordsPublished} />
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("ctags-published")}</div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {publishers && (
                      <Number value={publishers[0].tagsPublished} />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">
                  {t("lifetime-tags-applied")}
                </div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {publishers && <Number value={publishers[0].tagsApplied} />}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("lifetime-revenue")}</div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {publishers &&
                      toDp(
                        toEth(
                          publishers[0].publishedTagsAuctionRevenue +
                            publishers[0].publishedTagsTaggingFeeRevenue
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
                {t("tagging-records-published")}
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
                {t("ctags-published")}
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

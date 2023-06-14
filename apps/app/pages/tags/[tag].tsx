import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { useCtags } from "../../hooks/useCtags";
import { timestampToString } from "../../utils";
import { toDp, toEth } from "../../utils";
import { TaggingRecords } from "../../components/TaggingRecords";
import { Number } from "../../components/Number";
import { Truncate } from "../../components/Truncate";
import { CopyAndPaste } from "../../components/CopyAndPaste";
import { Panel } from "../../components/Panel";
import PageTitle from "../../components/PageTitle";

const Tag: NextPage = () => {
  const { query } = useRouter();
  const { tag } = query;
  const { t } = useTranslation("common");

  const { tags } = useCtags({
    pageSize: 1,
    skip: 0,
    filter: { machineName: tag },
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    },
  });

  const taggingRecordsFilter = { tags_: { machineName: tag } };

  return (
    <div className="max-w-6xl mx-auto mt-12">
      <Head>
        <title>{tags && tags[0].display} | Ethereum Tag Service</title>
      </Head>

      <PageTitle
        title={t("tag") + ": " + (tags && tags[0].display)}
        shareUrl="https://ets.xyz"
      />

      <div className="grid gap-6 mx-auto mt-8 lg:mb-12 mb-6 lg:gap-12 md:space-y-0 md:grid sm:w-full md:grid-cols-2">
        <div className="grid content-start w-full gap-6 mx-auto lg:gap-12">
          <div>
            <Panel title={t("overview")}>
              <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4">
                <div className="text-slate-500">{t("id")}</div>
                <div className="flex space-x-1">
                  <div className="grid flex-grow md:grid-flow-col justify-end">
                    <div className="text-slate-500 ">
                      {tags && Truncate(tags[0].id)}
                    </div>
                  </div>
                  <CopyAndPaste value={tags && tags[0].id} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("created")}</div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {tags && timestampToString(parseInt(tags[0].timestamp))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("expires")}</div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {tags &&
                      timestampToString(parseInt(tags[0].timestamp) + 63113904)}
                  </div>
                </div>
              </div>

              <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4">
                <div className="text-slate-500">{t("relayer")}</div>
                <div className="flex col-span-3 space-x-1">
                  <div className="grid flex-grow grid-cols-1 md:grid-flow-col">
                    <div className="overflow-hidden text-right text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                      <Link
                        href={`/relayers/${tags && tags[0].relayer.id}`}
                        className="text-pink-600 hover:text-pink-700">

                        {tags && tags[0].relayer.name}

                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4">
                <div className="text-slate-500">{t("creator")}</div>
                <div className="flex space-x-1 justify-end">
                  <div className="text-slate-500">
                    <Link
                      href={`/creators/${tags && tags[0].creator.id}`}
                      className="text-pink-600 hover:text-pink-700">

                      {tags && Truncate(tags[0].creator.id)}

                    </Link>
                  </div>
                  <CopyAndPaste value={tags && tags[0].creator.id} />
                </div>
              </div>

              <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4">
                <div className="flex-grow text-slate-500">{t("owner")}</div>
                <div className="flex space-x-1 justify-end">
                  <div className="text-slate-500">
                    <Link
                      href={`/owners/${tags && tags[0].owner.id}`}
                      className="text-pink-600 hover:text-pink-700">

                      {tags && Truncate(tags[0].owner.id)}

                    </Link>
                  </div>
                  <CopyAndPaste value={tags && tags[0].owner.id} />
                </div>
              </div>
            </Panel>
          </div>
        </div>
        <div className="grid content-start w-full gap-6 mx-auto lg:gap-12">
          <div>
            <Panel title={t("revenue")}>
              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("tagging-records")}</div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {tags && (
                      <Number value={tags[0].tagAppliedInTaggingRecord} />
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("creator")}</div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {tags && toDp(toEth(tags[0].creatorRevenue))} {t("matic")}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("owner")}</div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {tags && toDp(toEth(tags[0].ownerRevenue))} {t("matic")}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("relayer")}</div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {tags && toDp(toEth(tags[0].relayerRevenue))} {t("matic")}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("protocol")}</div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {tags && toDp(toEth(tags[0].protocolRevenue))} {t("matic")}
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
      <div className="pb-8">
        <TaggingRecords
          filter={taggingRecordsFilter}
          title={t("tag-tagging-records", {
            tag: tags && tags[0].display,
          })}
        />
      </div>
    </div>
  );
};

export default Tag;

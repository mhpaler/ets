import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { useRelayers } from "../../hooks/useRelayers";
import useTranslation from "next-translate/useTranslation";
import { timestampToString } from "../../utils";
import { toEth } from "../../utils";
import { TaggingRecords } from "../../components/TaggingRecords";
import { Tags } from "../../components/Tags";
import { Number } from "../../components/Number";
import { CopyAndPaste } from "../../components/CopyAndPaste";
import { Truncate } from "../../components/Truncate";
import { Panel } from "../../components/Panel";
import PageTitle from "../../components/PageTitle";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

const Relayer: NextPage = () => {
  const { query } = useRouter();
  const { relayer } = query;
  const { t } = useTranslation("common");

  const filter = {
    relayer_: { id: relayer },
  };

  const { relayers } = useRelayers({
    pageSize: 1,
    skip: 0,
    filter: { id: relayer },
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    },
  });

  const pageTitle = `${t("relayer")}: ${relayers && relayers[0].name}`;
  const browserTitle = `${pageTitle} | ETS`;

  return (
    <div className="max-w-7xl mx-auto mt-12">
      <Head>
        <title>{browserTitle}</title>
      </Head>

      <PageTitle title={pageTitle} shareUrl={"https://app.ets.xyz/relayers/" + (relayers && relayers[0].id)} />

      <div className="grid gap-6 mx-auto mt-8 lg:mb-12 mb-6 lg:gap-12 md:space-y-0 md:grid sm:w-full md:grid-cols-2">
        <div className="grid content-start w-full gap-6 mx-auto lg:gap-12">
          <div>
            <Panel title={t("overview")}>
              <div className="grid grid-cols-2 px-6 py-4 space-x-4 md:grid-flow-col">
                <div className="text-slate-500">{t("id")}</div>
                <div className="flex space-x-1 justify-end">
                  <div className="text-slate-500">{relayers && Truncate(relayers[0].id)}</div>
                  <CopyAndPaste value={relayers && relayers[0].id} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("created")}</div>
                <div className="text-right">
                  <div className="text-slate-500">{relayers && timestampToString(parseInt(relayers[0].firstSeen))}</div>
                </div>
              </div>

              <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4">
                <div className="text-slate-500">{t("creator")}</div>
                <div className="flex space-x-1 justify-end">
                  <div className="text-slate-500">
                    <Link
                      href={`/creators/${relayers && relayers[0].creator}`}
                      className="text-pink-600 hover:text-pink-700"
                    >
                      {relayers && Truncate(relayers[0].creator)}
                    </Link>
                  </div>
                  <CopyAndPaste value={relayers && relayers[0].creator} />
                </div>
              </div>

              <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4">
                <div className="flex-grow text-slate-500">{t("owner")}</div>
                <div className="flex space-x-1 justify-end">
                  <div className="text-slate-500">
                    <Link
                      href={`/owners/${relayers && relayers[0].owner}`}
                      className="text-pink-600 hover:text-pink-700"
                    >
                      {relayers && Truncate(relayers[0].owner)}
                    </Link>
                  </div>
                  <CopyAndPaste value={relayers && relayers[0].owner} />
                </div>
              </div>

              <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4">
                <div className="flex-grow text-slate-500">{t("status")}</div>
                <div className="flex space-x-1 justify-end">
                  <div className="text-slate-500">
                    {(relayers && relayers[0].pausedByOwner) || (relayers && relayers[0].lockedByProtocol)
                      ? t("disabled")
                      : t("enabled")}
                  </div>
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
                    {relayers && <Number value={relayers[0].taggingRecordsPublished} />}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("tags-published")}</div>
                <div className="text-right">
                  <div className="text-slate-500">{relayers && <Number value={relayers[0].tagsPublished} />}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("lifetime-tags-applied")}</div>
                <div className="text-right">
                  <div className="text-slate-500">{relayers && <Number value={relayers[0].tagsApplied} />}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("lifetime-revenue")}</div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {relayers &&
                      toEth(relayers[0].publishedTagsAuctionRevenue + relayers[0].publishedTagsTaggingFeeRevenue, 4)}
                    &nbsp;{t("matic")}
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
      <div>
        <div className="pb-8">
          <TaggingRecords
            filter={filter}
            title={t("relayer-tagging-records", {
              relayer: relayers && relayers[0].name,
            })}
          />
        </div>
        <div className="pb-8">
          <Tags
            filter={filter}
            title={t("relayer-tags", {
              relayer: relayers && relayers[0].name,
            })}
          />
        </div>
      </div>
    </div>
  );
};

export default Relayer;

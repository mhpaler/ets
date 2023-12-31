import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useOwners } from "../../hooks/useOwners";
import useTranslation from "next-translate/useTranslation";
import { timestampToString } from "../../utils";
import { toDp, toEth } from "../../utils";
import { Tags } from "../../components/Tags";
import { Number } from "../../components/Number";
import { CopyAndPaste } from "../../components/CopyAndPaste";
import { Truncate } from "../../components/Truncate";
import { Panel } from "../../components/Panel";
import PageTitle from "../../components/PageTitle";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

const Owner: NextPage = () => {
  const { query } = useRouter();
  const { owner } = query;
  const { t } = useTranslation("common");
  const filter = {
    owner_: { id: owner },
  };
  const { owners } = useOwners({
    pageSize: 1,
    skip: 0,
    filter: { id: owner },
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    },
  });

  const pageTitle = `${t("owners")}: ${owners && Truncate(owners[0].id)}`;
  const browserTitle = `${pageTitle} | ETS`;

  return (
    <div className="max-w-7xl mx-auto mt-12">
      <Head>
        <title>{browserTitle}</title>
      </Head>

      <PageTitle
        title={pageTitle}
        shareUrl={"https://app.ets.xyz/owners/" + (owners && owners[0].id)}
      />
      <div className="grid gap-6 mx-auto mt-8 lg:mb-12 mb-6 lg:gap-12 md:space-y-0 md:grid sm:w-full md:grid-cols-2">
        <div className="grid content-start w-full gap-6 mx-auto lg:gap-12">
          <div>
            <Panel title={t("overview")}>
              <div className="grid grid-cols-2 px-6 py-4 space-x-4 md:grid-flow-col">
                <div className="text-slate-500">{t("id")}</div>
                <div className="flex space-x-1 justify-end">
                  <div className="text-slate-500">
                    {owners && Truncate(owners[0].id)}
                  </div>
                  <CopyAndPaste value={owners && owners[0].id} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("first-seen")}</div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {owners && timestampToString(parseInt(owners[0].firstSeen))}
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
                <div className="text-slate-500">
                  {t("tags-owned", { timeframe: t("current") })}
                </div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {owners && <Number value={owners[0].tagsOwned} />}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">
                  {t("tags-owned", { timeframe: t("lifetime") })}
                </div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {owners && <Number value={owners[0].tagsOwnedLifeTime} />}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">
                  {t("owned-tags-in-tagging-records")}
                </div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {owners && (
                      <Number
                        value={owners[0].ownedTagsAddedToTaggingRecords}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("tagging-revenue")}</div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {owners &&
                      toDp(toEth(owners[0].ownedTagsTaggingFeeRevenue))}
                    &nbsp;{t("matic")}
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
      <div>
        <Tags
          filter={filter}
          title={t("owner-tags") + " " + (owners && Truncate(owners[0].id))}
        />
      </div>
    </div>
  );
};

export default Owner;

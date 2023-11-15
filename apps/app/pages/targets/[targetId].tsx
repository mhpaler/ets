import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { TaggingRecords } from "../../components/TaggingRecords";
import useTranslation from "next-translate/useTranslation";
import { useTargets } from "../../hooks/useTargets";
import { timestampToString } from "../../utils";
import { CopyAndPaste } from "../../components/CopyAndPaste";
import { Panel } from "../../components/Panel";
import { URI } from "../../components/URI";
import PageTitle from "../../components/PageTitle";
import { Truncate } from "../../components/Truncate";

const Target: NextPage = () => {
  const { query } = useRouter();
  const { targetId } = query;
  const { t } = useTranslation("common");
  const { targets } = useTargets({
    pageSize: 1,
    skip: 0,
    filter: { id: targetId },
    orderBy: "created",
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    },
  });

  const pageTitle = `${t("target")}: ${targets && Truncate(targets[0].id)}`;
  const browserTitle = `${pageTitle} | ETS`;

  return (
    <div className="max-w-7xl mx-auto mt-12">
      <Head>
        <title>{browserTitle}</title>
      </Head>

      <PageTitle
        title={pageTitle}
        shareUrl={"https://app.ets.xyz/targets/" + (targets && targets[0].id)}
      />
      <div className="grid gap-6 mx-auto mt-8 lg:mb-12 mb-6 lg:gap-12 md:space-y-0 md:grid sm:w-full md:grid-cols-1">
        <div className="grid content-start w-full gap-6 mx-auto lg:gap-12">
          <div>
            <Panel title={t("overview")}>
              <div className="grid grid-cols-3 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500 ">{t("id")}</div>
                <div className="text-slate-500 col-span-2 text-left truncate">
                  {targets && targets[0].id}
                </div>
              </div>

              <div className="grid grid-cols-3 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500 ">{t("created")}</div>
                <div className="text-slate-500 col-span-2 text-left">
                  {targets && timestampToString(parseInt(targets[0].created))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("URI")}</div>
                <div className="flex space-x-1 col-span-2 justify-start">
                  <div className="text-slate-500 truncate">
                    {targets && targets[0].targetURI}
                  </div>
                  <CopyAndPaste value={targets && targets[0].targetURI} />
                  <URI value={targets && targets[0].targetURI} />
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Target;

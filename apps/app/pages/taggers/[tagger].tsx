import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTaggers } from "../../hooks/useTaggers";
import useTranslation from "next-translate/useTranslation";
import { timestampToString } from "../../utils";
import { TaggingRecords } from "../../components/TaggingRecords";
import { Number } from "../../components/Number";
import { CopyAndPaste } from "../../components/CopyAndPaste";
import { Truncate } from "../../components/Truncate";
import { Panel } from "../../components/Panel";
import PageTitle from "../../components/PageTitle";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

const Tagger: NextPage = () => {
  const { query } = useRouter();
  const { tagger } = query;
  const { t } = useTranslation("common");
  const filter = {
    tagger_: { id: tagger },
  };
  const { taggers } = useTaggers({
    pageSize: 1,
    skip: 0,
    filter: { id: tagger },
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    },
  });

  const pageTitle = `${t("taggers")}: ${taggers && Truncate(taggers[0].id)}`;
  const browserTitle = `${pageTitle} | ETS`;

  return (
    <div className="max-w-7xl mx-auto mt-12">
      <Head>
        <title>{browserTitle}</title>
      </Head>

      <PageTitle
        title={pageTitle}
        shareUrl={"https://app.ets.xyz/taggers/" + (taggers && taggers[0].id)}
      />
      <div className="grid gap-6 mx-auto mt-8 lg:mb-12 mb-6 lg:gap-12 md:space-y-0 md:grid sm:w-full md:grid-cols-2">
        <div className="grid content-start w-full gap-6 mx-auto lg:gap-12">
          <div>
            <Panel title={t("overview")}>
              <div className="grid grid-cols-2 px-6 py-4 space-x-4 md:grid-flow-col">
                <div className="text-slate-500">{t("id")}</div>
                <div className="flex space-x-1 justify-end">
                  <div className="text-slate-500">
                    {taggers && Truncate(taggers[0].id)}
                  </div>
                  <CopyAndPaste value={taggers && taggers[0].id} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("first-seen")}</div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {taggers &&
                      timestampToString(parseInt(taggers[0].firstSeen))}
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
                  {t("tagging-records-created")}
                </div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {taggers && (
                      <Number value={taggers[0].taggingRecordsCreated} />
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("total-tags-applied")}</div>
                <div className="text-right">
                  <div className="text-slate-500">
                    {taggers && <Number value={taggers[0].tagsApplied} />}
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
      <div>
        <TaggingRecords filter={filter} title={t("tagging-records")} />
      </div>
    </div>
  );
};

export default Tagger;

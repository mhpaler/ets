import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTaggers } from "@app/hooks/useTaggers";
import useTranslation from "next-translate/useTranslation";
import { timestampToString } from "@app/utils";
import Layout from "@app/layouts/default";
import { TaggingRecords } from "@app/components/TaggingRecords";
import { Number } from "@app/components/Number";
import { CopyAndPaste } from "@app/components/CopyAndPaste";
import { Truncate } from "@app/components/Truncate";

import { Panel } from "@app/components/Panel";

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

  return (
    <Layout>
      <div className="col-span-12">
        <div className="grid gap-6 lg:gap-12 md:space-y-0 md:grid sm:w-full md:grid-cols-2">
          <div className="grid content-start w-full gap-6 mx-auto lg:gap-12 text-sm">
            <Panel title={t("overview")}>
              <div className="grid grid-cols-2 px-6 py-4 space-x-4 md:grid-flow-col hover:bg-slate-100">
                <div className="">{t("id")}</div>
                <div className="flex space-x-1 justify-end">
                  <div className="">{taggers && Truncate(taggers[0].id)}</div>
                  <CopyAndPaste value={taggers && taggers[0].id} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                <div className="">{t("first-seen")}</div>
                <div className="text-right">
                  <div className="">{taggers && timestampToString(parseInt(taggers[0].firstSeen))}</div>
                </div>
              </div>
            </Panel>
          </div>
          <div className="grid content-start w-full gap-6 mx-auto lg:gap-12 text-sm">
            <Panel title={t("stats")}>
              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                <div className="">{t("tagging-records-created")}</div>
                <div className="text-right">
                  <div className="">{taggers && <Number value={taggers[0].taggingRecordsCreated} />}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                <div className="">{t("total-tags-applied")}</div>
                <div className="text-right">
                  <div className="">{taggers && <Number value={taggers[0].tagsApplied} />}</div>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
      <div className="col-span-12">
        <TaggingRecords filter={filter} title={t("tagging-records")} />
      </div>
    </Layout>
  );
};

export default Tagger;

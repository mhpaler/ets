import type { NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { useTaggingRecords } from "@app/hooks/useTaggingRecords";
import { timestampToString } from "@app/utils";
import Layout from "@app/layouts/default";
import { Truncate } from "@app/components/Truncate";
import { CopyAndPaste } from "@app/components/CopyAndPaste";
import { URI } from "@app/components/URI";
import { Panel } from "@app/components/Panel";
import { Tag } from "@app/components/Tag";

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
    <Layout>
      <div className="col-span-12">
        <div className="grid gap-6 mx-auto lg:gap-12 md:space-y-0 md:grid sm:w-full md:grid-cols-1">
          <div className="grid content-start w-full gap-6 mx-auto lg:gap-12 text-sm">
            <Panel>
              <div className="grid grid-cols-3 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                <div className="font-semibold">{t("id")}</div>
                <div className="col-span-2 text-left truncate">
                  {Truncate(taggingRecords && taggingRecords[0].id, 80, "end")}
                </div>
              </div>

              <div className="grid grid-cols-3 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                <div className="font-semibold">{t("created")}</div>
                <div className="col-span-2 text-left">
                  {taggingRecords && timestampToString(parseInt(taggingRecords[0].timestamp))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                <div className="font-semibold">{t("relayer")}</div>
                <div className="col-span-2 text-left">
                  <Link
                    href={`/relayers/${taggingRecords && taggingRecords[0].relayer.id}`}
                    className="link link-primary"
                  >
                    {taggingRecords && taggingRecords[0].relayer.name}
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                <div className="font-semibold">{t("tagger")}</div>
                <div className="flex space-x-1 col-span-2 justify-start">
                  <div className="">
                    <Link
                      href={`/taggers/${taggingRecords && taggingRecords[0].tagger.id}`}
                      className="link link-primary"
                    >
                      {taggingRecords && Truncate(taggingRecords[0].tagger.id, 13, "middle")}
                    </Link>
                  </div>
                  <CopyAndPaste value={taggingRecords && taggingRecords[0].tagger.id} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                <div className="font-semibold">{t("record-type")}</div>
                <div className="col-span-2 text-left ">{taggingRecords && taggingRecords[0].recordType}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                <div className="font-semibold">{t("target-id")}</div>
                <div className="flex space-x-1 col-span-2 justify-start">
                  <div className="truncate">
                    <Link
                      href={`/targets/${taggingRecords && taggingRecords[0].target.id}`}
                      className="link link-primary"
                    >
                      {Truncate(taggingRecords && taggingRecords[0].target.id, 32, "end")}
                    </Link>
                  </div>
                  <CopyAndPaste value={taggingRecords && taggingRecords[0].target.id} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                <div className="font-semibold">{t("target-uri")}</div>
                <div className="flex space-x-1 col-span-2 justify-start">
                  <div className="truncate">{taggingRecords && taggingRecords[0].target.targetURI}</div>
                  <CopyAndPaste value={taggingRecords && taggingRecords[0].target.targetURI} />
                  <URI value={taggingRecords && taggingRecords[0].target.targetURI} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                <div className="font-semibold">{t("tags")}</div>
                <div className="col-span-2 text-left">
                  {taggingRecords &&
                    taggingRecords[0].tags.map((tag: any, i: number) => (
                      <span key={i} className="mr-2">
                        <Tag tag={tag} />
                      </span>
                    ))}
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TaggingRecord;

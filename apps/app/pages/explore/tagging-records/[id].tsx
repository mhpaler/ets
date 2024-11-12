import Address from "@app/components/Address";
import { CopyAndPaste } from "@app/components/CopyAndPaste";
import { Panel } from "@app/components/Panel";
import { Tag } from "@app/components/Tag";
import { Truncate } from "@app/components/Truncate";
import { URI } from "@app/components/URI";
import { useTaggingRecords } from "@app/hooks/useTaggingRecords";
import Layout from "@app/layouts/default";
import { timestampToString } from "@app/utils";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { useRouter } from "next/router";

const TaggingRecord: NextPage = () => {
  const { query } = useRouter();
  const { id } = query;
  const { t } = useTranslation("common");
  const { taggingRecords } = useTaggingRecords({
    pageSize: 1,
    skip: 0,
    filter: { id },
  });

  const taggingRecord = taggingRecords?.[0];

  return (
    <Layout>
      {taggingRecord && (
        <div className="col-span-12">
          <div className="grid gap-6 mx-auto lg:gap-12 md:space-y-0 md:grid sm:w-full md:grid-cols-1">
            <div className="grid content-start w-full gap-6 mx-auto lg:gap-12 text-sm">
              <Panel>
                <div className="grid grid-cols-3 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                  <div className="font-semibold">{t("id")}</div>
                  <div className="col-span-2 text-left truncate">{Truncate(taggingRecord.id, 80, "end")}</div>
                </div>

                <div className="grid grid-cols-3 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                  <div className="font-semibold">{t("created")}</div>
                  <div className="col-span-2 text-left">
                    {taggingRecords && timestampToString(Number.parseInt(taggingRecords[0].timestamp))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                  <div className="font-semibold">{t("relayer")}</div>
                  <div className="col-span-2 text-left">
                    <Link href={`/explore/relayers/${taggingRecord.relayer.id}`} className="link link-primary">
                      {taggingRecord.relayer.name}
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                  <div className="font-semibold">{t("tagger")}</div>
                  <div className="flex col-span-2 justify-start">
                    <Address
                      href={`/explore/taggers/${taggingRecord.tagger.id}`}
                      address={taggingRecord.tagger?.id}
                      ens={taggingRecord.tagger?.ens}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                  <div className="font-semibold">{t("record-type")}</div>
                  <div className="col-span-2 text-left ">{taggingRecord.recordType}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                  <div className="font-semibold">{t("target-id")}</div>
                  <div className="flex space-x-1 col-span-2 justify-start">
                    <div className="truncate">
                      <Link href={`/explore/targets/${taggingRecord.target.id}`} className="link link-primary">
                        {taggingRecord.target.id}
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                  <div className="font-semibold">{t("target-uri")}</div>
                  <div className="flex col-span-2 justify-start">
                    <div className="truncate">{taggingRecord.target.targetURI}</div>
                    <CopyAndPaste value={taggingRecord.target.targetURI} />
                    <URI value={taggingRecord.target.targetURI} hoverText={t("open-in-new-tab")} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                  <div className="font-semibold">{t("tags")}</div>
                  <div className="col-span-2 text-left">
                    {taggingRecords?.[0].tags.map((tag: any, i: number) => (
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
      )}
    </Layout>
  );
};

export default TaggingRecord;

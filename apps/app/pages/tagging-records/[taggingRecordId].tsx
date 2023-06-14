import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { useTaggingRecords } from "../../hooks/useTaggingRecords";
import { timestampToString } from "../../utils";
import { Truncate } from "../../components/Truncate";
import { CopyAndPaste } from "../../components/CopyAndPaste";
import { URI } from "../../components/URI";
import { Panel } from "../../components/Panel";
import PageTitle from "../../components/PageTitle";
import { Tag } from "../../components/Tag";

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
    <div className="max-w-6xl mx-auto mt-12">
      <Head>
        <title>
          {t("tagging-record") +
            ": " +
            (taggingRecords && Truncate(taggingRecords[0].id))}{" "}
          | Ethereum Tag Service
        </title>
      </Head>

      <PageTitle
        title={
          t("tagging-record") +
          ": " +
          (taggingRecords && Truncate(taggingRecords[0].id))
        }
        shareUrl="https://ets.xyz"
      />
      <div className="grid gap-6 mx-auto mt-8 lg:mb-12 mb-6 lg:gap-12 md:space-y-0 md:grid sm:w-full md:grid-cols-1">
        <div className="grid content-start w-full gap-6 mx-auto lg:gap-12">
          <div>
            <Panel title={t("overview")}>
              <div className="grid grid-cols-3 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500 ">{t("id")}</div>
                <div className="text-slate-500 col-span-2 text-left truncate">
                  {taggingRecords && taggingRecords[0].id}
                </div>
              </div>

              <div className="grid grid-cols-3 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500 ">{t("created")}</div>
                <div className="text-slate-500 col-span-2 text-left">
                  {taggingRecords &&
                    timestampToString(parseInt(taggingRecords[0].timestamp))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("relayer")}</div>
                <div className="text-slate-500 col-span-2 text-left">
                  <Link
                    href={`/relayers/${
                      taggingRecords && taggingRecords[0].relayer.id
                    }`}
                    className="text-pink-600 hover:text-pink-700">

                    {taggingRecords && taggingRecords[0].relayer.name}

                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("tagger")}</div>
                <div className="flex space-x-1 col-span-2 justify-start">
                  <div className="text-slate-500">
                    <Link
                      href={`/taggers/${
                        taggingRecords && taggingRecords[0].tagger.id
                      }`}
                      className="text-pink-600 hover:text-pink-700">

                      {taggingRecords &&
                        Truncate(taggingRecords[0].tagger.id)}

                    </Link>
                  </div>
                  <CopyAndPaste
                    value={taggingRecords && taggingRecords[0].tagger.id}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("record-type")}</div>
                <div className="text-slate-500 col-span-2 text-left ">
                  {taggingRecords && taggingRecords[0].recordType}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("target-id")}</div>
                <div className="flex space-x-1 col-span-2 justify-start">
                  <div className="text-slate-500 truncate">
                    <Link
                      href={`/targets/${
                        taggingRecords && taggingRecords[0].target.id
                      }`}
                      className="text-pink-600 hover:text-pink-700">

                      {taggingRecords && taggingRecords[0].target.id}

                    </Link>
                  </div>
                  <CopyAndPaste
                    value={taggingRecords && taggingRecords[0].target.id}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("target-uri")}</div>
                <div className="flex space-x-1 col-span-2 justify-start">
                  <div className="text-slate-500 truncate">
                    {taggingRecords && taggingRecords[0].target.targetURI}
                  </div>
                  <CopyAndPaste
                    value={taggingRecords && taggingRecords[0].target.targetURI}
                  />
                  <URI
                    value={taggingRecords && taggingRecords[0].target.targetURI}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 px-6 py-4 md:grid-flow-col">
                <div className="text-slate-500">{t("tags")}</div>
                <div className="text-slate-500 col-span-2 text-left">
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
    </div>
  );
};

export default TaggingRecord;

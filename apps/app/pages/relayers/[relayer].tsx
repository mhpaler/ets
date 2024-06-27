import type { NextPage } from "next";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { useCtags } from "@app/hooks/useCtags";
import { useRelayers } from "@app/hooks/useRelayers";
import { timestampToString } from "@app/utils";
import { toEth } from "@app/utils";
import Layout from "@app/layouts/default";
import { TaggingRecords } from "@app/components/TaggingRecords";
import { TimeAgo } from "@app/components/TimeAgo";
import { Tags } from "@app/components/Tags";
import { Tag } from "@app/components/Tag";
import { Number } from "@app/components/Number";
import { CopyAndPaste } from "@app/components/CopyAndPaste";
import { Truncate } from "@app/components/Truncate";
import { Panel } from "@app/components/Panel";

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

  const { tags = [] } = useCtags({
    filter: { relayer_: { id: relayer } },
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 1500,
    },
  });

  return (
    <Layout>
      <div className="col-span-12">
        <div className="grid gap-6 mx-auto lg:gap-12 md:space-y-0 md:grid sm:w-full md:grid-cols-2">
          <div className="grid content-start w-full gap-6 mx-auto lg:gap-12 text-sm">
            <div>
              <Panel title={t("overview")}>
                <div className="grid grid-cols-2 px-6 py-4 space-x-4 md:grid-flow-col hover:bg-slate-100">
                  <div className="font-semibold">{t("id")}</div>
                  <div className="flex space-x-1 justify-end">
                    <div className="">{relayers && Truncate(relayers[0].id, 14, "middle")}</div>
                    <CopyAndPaste value={relayers && relayers[0].id} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                  <div className="font-semibold">{t("created")}</div>
                  <div className="text-right">
                    <div className="">{relayers && timestampToString(parseInt(relayers[0].firstSeen))}</div>
                  </div>
                </div>

                <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4 hover:bg-slate-100">
                  <div className="font-semibold">{t("creator")}</div>
                  <div className="flex space-x-1 justify-end">
                    <div className="">{relayers && Truncate(relayers[0].creator, 14, "middle")}</div>
                    <CopyAndPaste value={relayers && relayers[0].creator} />
                  </div>
                </div>

                <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4 hover:bg-slate-100">
                  <div className="font-semibold">{t("owner")}</div>
                  <div className="flex space-x-1 justify-end">
                    <div className="">{relayers && Truncate(relayers[0].owner, 14, "middle")}</div>
                    <CopyAndPaste value={relayers && relayers[0].owner} />
                  </div>
                </div>

                <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4 hover:bg-slate-100">
                  <div className="font-semibold">{t("status")}</div>
                  <div className="flex space-x-1 justify-end">
                    <div className="">
                      {(relayers && relayers[0].pausedByOwner) || (relayers && relayers[0].lockedByProtocol)
                        ? t("disabled")
                        : t("enabled")}
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
          <div className="grid content-start w-full gap-6 mx-auto lg:gap-12 text-sm">
            <div>
              <Panel title={t("stats")}>
                <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                  <div className="font-semibold">{t("tagging-records")}</div>
                  <div className="text-right">
                    <div className="">{relayers && <Number value={relayers[0].taggingRecordsPublished} />}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                  <div className="font-semibold">{t("tags-published")}</div>
                  <div className="text-right">
                    <div className="">{relayers && <Number value={relayers[0].tagsPublished} />}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                  <div className="font-semibold">{t("lifetime-tags-applied")}</div>
                  <div className="text-right">
                    <div className="">{relayers && <Number value={relayers[0].tagsApplied} />}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                  <div className="font-semibold">{t("lifetime-revenue")}</div>
                  <div className="text-right">
                    <div className="">
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
      </div>
      <div className="col-span-12">
        <TaggingRecords
          filter={filter}
          title={t("relayer-tagging-records", {
            relayer: relayers && relayers[0].name,
          })}
        />
      </div>
      <div className="col-span-12">
        <Tags
          title={t("relayer-tags", {
            relayer: relayers && relayers[0].name,
          })}
          tags={tags}
          rowLink={false}
          columnsConfig={[
            { title: "tag", field: "tag", formatter: (_: any, tag: any) => <Tag tag={tag} /> },
            {
              title: "created",
              field: "timestamp",
              formatter: (value: any) => <TimeAgo date={value * 1000} />,
            },
            { title: t("creator"), field: "creator.id", formatter: (value: any) => Truncate(value, 14, "middle") },
            { title: t("owner"), field: "owner.id", formatter: (value: any) => Truncate(value, 14, "middle") },
            { title: "tagging records", field: "tagAppliedInTaggingRecord" },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Relayer;

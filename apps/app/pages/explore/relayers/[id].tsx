import type { NextPage } from "next";
import Link from "next/link";
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
import { Panel } from "@app/components/Panel";
import Address from "@app/components/Address";

const Relayer: NextPage = () => {
  const { query } = useRouter();
  const { id } = query;
  const { t } = useTranslation("common");

  const filter = {
    relayer_: { id },
  };

  const { relayers } = useRelayers({
    pageSize: 1,
    skip: 0,
    filter: { id },
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
    filter: { relayer_: { id } },
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 1500,
    },
  });

  const relayer = relayers ? relayers[0] : null;

  return (
    <Layout>
      {relayer && (
        <>
          <div className="col-span-12">
            <div className="grid gap-6 mx-auto lg:gap-12 md:space-y-0 md:grid sm:w-full md:grid-cols-2">
              <div className="grid content-start w-full gap-6 mx-auto lg:gap-12 text-sm">
                <div>
                  <Panel title={t("overview")}>
                    <div className="grid grid-cols-2 px-6 py-4 space-x-4 md:grid-flow-col hover:bg-slate-100">
                      <div className="font-semibold">{t("id")}</div>
                      <div className="flex space-x-1 justify-end">
                        <Address address={relayer.id} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                      <div className="font-semibold">{t("created")}</div>
                      <div className="text-right">
                        <div className="">{timestampToString(relayer.firstSeen)}</div>
                      </div>
                    </div>

                    <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4 hover:bg-slate-100">
                      <div className="font-semibold">{t("creator")}</div>
                      <div className="flex space-x-1 justify-end">
                        <Link href={`/explore/creators/${relayer.creator.id}`} className="link link-primary">
                          <Address address={relayer.creator.id} ens={relayer.creator.ens} />
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4 hover:bg-slate-100">
                      <div className="font-semibold">{t("owner")}</div>
                      <div className="flex space-x-1 justify-end">
                        <Link href={`/explore/owners/${relayer.owner.id}`} className="link link-primary">
                          <Address address={relayer.owner.id} ens={relayer.owner.ens} />
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4 hover:bg-slate-100">
                      <div className="font-semibold">{t("status")}</div>
                      <div className="flex space-x-1 justify-end">
                        <div className="">
                          {relayer.pausedByOwner || relayer.lockedByProtocol ? t("disabled") : t("enabled")}
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
                        <div className="">{<Number value={relayer.taggingRecordsPublished} />}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                      <div className="font-semibold">{t("tags-published")}</div>
                      <div className="text-right">
                        <div className="">{<Number value={relayer.tagsPublished} />}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                      <div className="font-semibold">{t("lifetime-tags-applied")}</div>
                      <div className="text-right">
                        <div className="">{<Number value={relayer.tagsApplied} />}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                      <div className="font-semibold">{t("lifetime-revenue")}</div>
                      <div className="text-right">
                        <div className="">
                          {relayers &&
                            toEth(relayer.publishedTagsAuctionRevenue + relayer.publishedTagsTaggingFeeRevenue, 4)}
                          &nbsp;ETH
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
                relayer: relayer.name,
              })}
            />
          </div>
          <div className="col-span-12">
            <Tags
              title={t("relayer-tags", { relayer: relayer.name })}
              tags={tags}
              rowLink={false}
              columnsConfig={[
                {
                  title: "tag",
                  field: "tag",
                  formatter: (_: any, tag: any) => <Tag tag={tag} />,
                },
                {
                  title: "created",
                  field: "timestamp",
                  formatter: (value: any) => <TimeAgo date={value * 1000} />,
                },
                {
                  title: t("creator"),
                  field: "creator",
                  formatter: (value: any) => (
                    <Link href={`/explore/creators/${value.id}`} className="link link-primary">
                      <Address address={value.id} ens={value.ens} />
                    </Link>
                  ),
                },
                {
                  title: t("owner"),
                  field: "owner",
                  formatter: (value: any) => (
                    <Link href={`/explore/owners/${value.id}`} className="link link-primary">
                      <Address address={value.id} ens={value.ens} />
                    </Link>
                  ),
                },
                {
                  title: "tagging records",
                  field: "tagAppliedInTaggingRecord",
                  formatter: (value: any) => value,
                },
              ]}
            />
          </div>
        </>
      )}
    </Layout>
  );
};

export default Relayer;

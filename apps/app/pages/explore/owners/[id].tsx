import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useOwners } from "@app/hooks/useOwners";
import { useCtags } from "@app/hooks/useCtags";

import useTranslation from "next-translate/useTranslation";
import { timestampToString } from "@app/utils";
import { toEth } from "@app/utils";
import Layout from "@app/layouts/default";
import { TimeAgo } from "@app/components/TimeAgo";
import { Tags } from "@app/components/Tags";
import { Tag } from "@app/components/Tag";
import { Number } from "@app/components/Number";
import { CopyAndPaste } from "@app/components/CopyAndPaste";
import { Truncate } from "@app/components/Truncate";
import { Panel } from "@app/components/Panel";
import ENSAddress from "@app/components/ENSAddress";

const Owner: NextPage = () => {
  const { query } = useRouter();
  const { id } = query;
  const { t } = useTranslation("common");
  const { owners } = useOwners({
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

  const owner = owners ? owners[0] : null;

  const { tags = [] } = useCtags({
    filter: { owner_: { id } },
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
      {owner && (
        <div className="col-span-12">
          <div className="grid gap-6 mx-auto mt-8 lg:mb-12 mb-6 lg:gap-12 md:space-y-0 md:grid sm:w-full md:grid-cols-2">
            <div className="grid content-start w-full gap-6 mx-auto lg:gap-12 text-sm">
              <div>
                <Panel title={t("overview")}>
                  <div className="grid grid-cols-2 px-6 py-4 space-x-4 md:grid-flow-col hover:bg-slate-100 ">
                    <div className="font-semibold">{t("id")}</div>
                    <div className="flex space-x-1 justify-end">
                      <ENSAddress address={owner.id} ens={owner.ens} />
                      <CopyAndPaste value={owner.id} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                    <div className="font-semibold">{t("first-seen")}</div>
                    <div className="text-right">
                      <div className="">{timestampToString(parseInt(owner.firstSeen))}</div>
                    </div>
                  </div>
                </Panel>
              </div>
            </div>
            <div className="grid content-start w-full gap-6 mx-auto lg:gap-12 text-sm">
              <div>
                <Panel title={t("stats")}>
                  <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                    <div className="font-semibold">{t("tags-owned", { timeframe: t("current") })}</div>
                    <div className="text-right">
                      <div className="">{<Number value={parseInt(owner.tagsOwned)} />}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                    <div className="font-semibold">{t("tags-owned", { timeframe: t("lifetime") })}</div>
                    <div className="text-right">
                      <div className="">{<Number value={parseInt(owner.tagsOwnedLifeTime)} />}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                    <div className="font-semibold">{t("owned-tags-in-tagging-records")}</div>
                    <div className="text-right">
                      <div className="">{<Number value={parseInt(owner.ownedTagsAddedToTaggingRecords)} />}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                    <div className="font-semibold">{t("tagging-revenue")}</div>
                    <div className="text-right">
                      <div className="">
                        {toEth(parseFloat(owner.ownedTagsTaggingFeeRevenue), 4)}
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
              title={t("owner-tags") + " " + Truncate(owner.id, 13, "middle")}
              tags={tags}
              rowLink={false}
              columnsConfig={[
                { title: "tag", field: "tag", formatter: (_: any, tag: any) => <Tag tag={tag} /> },
                {
                  title: "created",
                  field: "timestamp",
                  formatter: (value: any, _: any) => <TimeAgo date={value * 1000} />,
                },
                { title: "tagging records", field: "tagAppliedInTaggingRecord" },
              ]}
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Owner;

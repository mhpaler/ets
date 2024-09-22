import { useCtags } from "@app/hooks/useCtags";
import { useOwners } from "@app/hooks/useOwners";
import type { NextPage } from "next";
import { useRouter } from "next/router";

import Address from "@app/components/Address";
import { FormattedNumber } from "@app/components/FormattedNumber";
import { Panel } from "@app/components/Panel";
import { Tags } from "@app/components/Tags";
import { Truncate } from "@app/components/Truncate";
import { useCurrentChain } from "@app/hooks/useCurrentChain";
import Layout from "@app/layouts/default";
import { timestampToString } from "@app/utils";
import { toEth } from "@app/utils";
import useTranslation from "next-translate/useTranslation";

const Owner: NextPage = () => {
  const { query } = useRouter();
  const { id } = query;
  const { t } = useTranslation("common");
  const chain = useCurrentChain();
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
      refreshInterval: 0,
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
                    <div className="flex justify-end">
                      <Address address={owner.id} ens={owner.ens} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                    <div className="font-semibold">{t("first-seen")}</div>
                    <div className="text-right">
                      <div className="">{timestampToString(Number.parseInt(owner.firstSeen))}</div>
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
                      <div className="">{<FormattedNumber value={Number.parseInt(owner.tagsOwned)} />}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                    <div className="font-semibold">{t("tags-owned", { timeframe: t("lifetime") })}</div>
                    <div className="text-right">
                      <div className="">{<FormattedNumber value={Number.parseInt(owner.tagsOwnedLifeTime)} />}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                    <div className="font-semibold">{t("owned-tags-in-tagging-records")}</div>
                    <div className="text-right">
                      <div className="">
                        {<FormattedNumber value={Number.parseInt(owner.ownedTagsAddedToTaggingRecords)} />}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                    <div className="font-semibold">{t("tagging-revenue")}</div>
                    <div className="text-right">
                      <div className="">
                        {toEth(Number.parseFloat(owner.ownedTagsTaggingFeeRevenue), 8)}
                        &nbsp;{chain?.nativeCurrency.symbol}
                      </div>
                    </div>
                  </div>
                </Panel>
              </div>
            </div>
          </div>
          <div>
            <Tags
              title={`${t("owner-tags")} ${Truncate(owner.id, 13, "middle")}`}
              tags={tags}
              rowLink={false}
              columns={["tag", "created", "taggingRecords"]}
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Owner;

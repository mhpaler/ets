import Address from "@app/components/Address";
import { FormattedNumber } from "@app/components/FormattedNumber";
import { Panel } from "@app/components/Panel";
import { Tags } from "@app/components/Tags";
import { Truncate } from "@app/components/Truncate";
import { useCreators } from "@app/hooks/useCreators";
import { useCtags } from "@app/hooks/useCtags";
import { useCurrentChain } from "@app/hooks/useCurrentChain";
import Layout from "@app/layouts/default";
import { timestampToString, toEth } from "@app/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

const Creator: NextPage = () => {
  const { query } = useRouter();
  const { id } = query;
  const { t } = useTranslation("common");
  const chain = useCurrentChain();
  const { creators } = useCreators({
    pageSize: 1,
    skip: 0,
    filter: { id },
  });
  const creator = creators ? creators[0] : null;
  const { tags = [], isLoading } = useCtags({
    filter: { creator_: { id } },
  });

  return (
    <Layout>
      {creator && (
        <div className="col-span-12">
          <div className="grid gap-6 mx-auto mt-8 lg:mb-12 mb-6 lg:gap-12 md:space-y-0 md:grid sm:w-full md:grid-cols-2">
            <div className="grid content-start w-full gap-6 mx-auto lg:gap-12 text-sm">
              <div>
                <Panel title={t("overview")}>
                  <div className="grid grid-cols-2 px-6 py-4 space-x-4 md:grid-flow-col hover:bg-slate-100">
                    <div className="font-semibold">{t("id")}</div>
                    <div className="flex space-x-1 justify-end">
                      <Address address={creator.id} ens={creator.ens} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                    <div className="font-semibold">{t("first-seen")}</div>
                    <div className="text-right">
                      <div className="">{timestampToString(Number.parseInt(creator.firstSeen))}</div>
                    </div>
                  </div>
                </Panel>
              </div>
            </div>
            <div className="grid content-start w-full gap-6 mx-auto lg:gap-12 text-sm">
              <div>
                <Panel title={t("stats")}>
                  <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                    <div className="font-semibold">{t("tags-created")}</div>
                    <div className="text-right">
                      <div className="">{<FormattedNumber value={Number.parseInt(creator.tagsCreated)} />}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                    <div className="font-semibold">{t("created-tags-in-tagging-record")}</div>
                    <div className="text-right">
                      <div className="">
                        {<FormattedNumber value={Number.parseInt(creator.createdTagsAddedToTaggingRecords)} />}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                    <div className="font-semibold">{t("created-tags-auction-revenue")}</div>
                    <div className="text-right">
                      <div className="">
                        {toEth(Number.parseFloat(creator.createdTagsAuctionRevenue), 8)}
                        &nbsp;{chain?.nativeCurrency.symbol}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                    <div className="font-semibold">{t("created-tags-tagging-revenue")}</div>
                    <div className="text-right">
                      <div className="">
                        {toEth(Number.parseFloat(creator.createdTagsTaggingFeeRevenue), 8)}
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
              title={t("tags-created-by", { creator: Truncate(creator.id, 13, "middle") })}
              loading={isLoading}
              columns={["tag", "created", "taggingRecords", "totalRevenue"]}
              tags={tags}
              rowLink={false}
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Creator;

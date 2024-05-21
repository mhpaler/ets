import type { NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { useSystem } from "@app/hooks/useSystem";
import { useCtags } from "@app/hooks/useCtags";
import { useCurrentChain } from "@app/hooks/useCurrentChain";
import Layout from "@app/layouts/default";
import { timestampToString } from "@app/utils";
import { toEth } from "@app/utils";

import { TaggingRecords } from "@app/components/TaggingRecords";
import { TagGraphic } from "@app/components/TagGraphic";
import { Truncate } from "@app/components/Truncate";
import { CopyAndPaste } from "@app/components/CopyAndPaste";
import { Panel } from "@app/components/Panel";

const Tag: NextPage = () => {
  const { query } = useRouter();
  const { ownershipTermLength } = useSystem();
  const chain = useCurrentChain();
  const { tag } = query;
  const { t } = useTranslation("common");

  const { tags } = useCtags({
    pageSize: 1,
    skip: 0,
    filter: { machineName: tag },
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    },
  });

  const taggingRecordsFilter = { tags_: { machineName: tag } };

  if (!tags || tags.length === 0) {
    return (
      <Layout>
        <div className="loading loading-spinner loading-md" />
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="col-span-12 xl:col-span-4">
        <div>
          <TagGraphic tag={tags[0]} />
        </div>
      </section>
      <section className="col-span-12 xl:col-span-8 flex flex-col gap-y-12 text-sm">
        <Panel title={t("overview")}>
          <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4 hover:bg-slate-100">
            <div className="font-semibold">{t("id")}</div>
            <div className="flex space-x-1">
              <div className="grid flex-grow md:grid-flow-col justify-end">
                <div className=" ">{tags && Truncate(tags[0].id)}</div>
              </div>
              <CopyAndPaste value={tags && tags[0].id} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
            <div className="font-semibold">{t("created")}</div>
            <div className="text-right">
              <div className="">{tags && timestampToString(tags[0].timestamp)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
            <div className="font-semibold">{t("expires")}</div>
            <div className="text-right">
              <div className="">{tags && timestampToString(+tags[0].timestamp + ownershipTermLength)}</div>
            </div>
          </div>

          <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4 hover:bg-slate-100">
            <div className="font-semibold">{t("relayer")}</div>
            <div className="flex col-span-3 space-x-1">
              <div className="grid flex-grow grid-cols-1 md:grid-flow-col ">
                <div className="overflow-hidden text-right text-ellipsis whitespace-nowrap">
                  <Link href={`/relayers/${tags && tags[0].relayer.id}`} className="link link-primary">
                    {tags && tags[0].relayer.name}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4 hover:bg-slate-100">
            <div className="font-semibold">{t("creator")}</div>
            <div className="flex space-x-1 justify-end">
              <div className="">
                <Link href={`/creators/${tags && tags[0].creator.id}`} className="link link-primary">
                  {tags && Truncate(tags[0].creator.id)}
                </Link>
              </div>
              <CopyAndPaste value={tags && tags[0].creator.id} />
            </div>
          </div>

          <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4 hover:bg-slate-100">
            <div className="font-semibold">{t("owner")}</div>
            <div className="flex space-x-1 justify-end">
              <div className="">
                <Link href={`/owners/${tags && tags[0].owner.id}`} className="link link-primary">
                  {tags && Truncate(tags[0].owner.id)}
                </Link>
              </div>
              <CopyAndPaste value={tags && tags[0].owner.id} />
            </div>
          </div>
        </Panel>
        <Panel title={t("revenue")}>
          <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
            <div className="font-semibold">{t("tagging-records")}</div>
            <div className="text-right">
              <div className="">{tags && tags[0].tagAppliedInTaggingRecord}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
            <div className="font-semibold">{t("creator")}</div>
            <div className="text-right">
              <div className="">
                {tags && toEth(tags[0].creatorRevenue, 8)} {chain?.nativeCurrency.symbol}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
            <div className="font-semibold">{t("owner")}</div>
            <div className="text-right">
              <div className="">
                {tags && toEth(tags[0].ownerRevenue, 8)} {chain?.nativeCurrency.symbol}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
            <div className="font-semibold">{t("relayer")}</div>
            <div className="text-right">
              <div className="">
                {tags && toEth(tags[0].relayerRevenue, 8)} {chain?.nativeCurrency.symbol}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
            <div className="font-semibold">{t("protocol")}</div>
            <div className="text-right">
              <div className="">
                {tags && toEth(tags[0].protocolRevenue, 8)} {chain?.nativeCurrency.symbol}
              </div>
            </div>
          </div>
        </Panel>
      </section>
      <div className="col-span-12">
        <TaggingRecords
          filter={taggingRecordsFilter}
          title={t("tag-tagging-records", {
            tag: tags && tags[0].display,
          })}
        />
      </div>
    </Layout>
  );
};

export default Tag;

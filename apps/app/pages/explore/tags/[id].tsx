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

import { AuctionProvider } from "@app/context/AuctionContext";
import WithinTagAuctionDisplay from "@app/components/auction/WithinTagAuctionDisplay";

import { TaggingRecords } from "@app/components/TaggingRecords";
import { TagGraphic } from "@app/components/TagGraphic";
import { Truncate } from "@app/components/Truncate";
import { CopyAndPaste } from "@app/components/CopyAndPaste";
import { Panel } from "@app/components/Panel";

const Tag: NextPage = () => {
  const { query } = useRouter();
  const { ownershipTermLength } = useSystem();
  const chain = useCurrentChain();
  const { id } = query;
  const { t } = useTranslation("common");

  const { tags } = useCtags({
    pageSize: 1,
    skip: 0,
    filter: { machineName: id },
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    },
  });

  const tag = tags ? tags[0] : null;

  const taggingRecordsFilter = { tags_: { machineName: id } };

  if (!tag || tags?.length === 0) {
    return (
      <Layout>
        <div className="loading loading-spinner loading-md" />
      </Layout>
    );
  }

  let auctionBlock;
  if (tag.auctions && tag.auctions.length > 0) {
    const auction = tag.auctions[tag.auctions.length - 1];
    auctionBlock = (
      <AuctionProvider auctionId={Number(auction.id)}>
        <WithinTagAuctionDisplay />
      </AuctionProvider>
    );
  } else {
    auctionBlock = <div>NO AUCTION FOUND</div>;
  }

  return (
    <Layout>
      <section className="col-span-12 xl:col-span-4 flex flex-col gap-y-12  text-sm">
        <TagGraphic tag={tag} />
        <Panel title={t("auction")}>
          <div className="p-6">{auctionBlock}</div>
        </Panel>
      </section>
      <section className="col-span-12 xl:col-span-8 flex flex-col gap-y-12 text-sm">
        <Panel title={t("overview")}>
          <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4 hover:bg-slate-100">
            <div className="font-semibold">{t("id")}</div>
            <div className="flex space-x-1">
              <div className="grid flex-grow md:grid-flow-col justify-end">
                <div className=" ">{Truncate(tag.id)}</div>
              </div>
              <CopyAndPaste value={tag.id} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
            <div className="font-semibold">{t("created")}</div>
            <div className="text-right">
              <div className="">{timestampToString(tag.timestamp)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
            <div className="font-semibold">{t("expires")}</div>
            <div className="text-right">
              <div className="">{timestampToString(+tag.timestamp + ownershipTermLength)}</div>
            </div>
          </div>

          <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4 hover:bg-slate-100">
            <div className="font-semibold">{t("relayer")}</div>
            <div className="flex col-span-3 space-x-1">
              <div className="grid flex-grow grid-cols-1 md:grid-flow-col ">
                <div className="overflow-hidden text-right text-ellipsis whitespace-nowrap">
                  <Link href={`/explore/relayers/${tag.relayer.id}`} className="link link-primary">
                    {tag.relayer.name}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4 hover:bg-slate-100">
            <div className="font-semibold">{t("creator")}</div>
            <div className="flex space-x-1 justify-end">
              <div className="">
                <Link href={`/creators/${tag.creator.id}`} className="link link-primary">
                  {tag.creator.ens ? tag.creator.ens : Truncate(tag.creator.id)}
                </Link>
              </div>
              <CopyAndPaste value={tag.creator.id} />
            </div>
          </div>

          <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4 hover:bg-slate-100">
            <div className="font-semibold">{t("owner")}</div>
            <div className="flex space-x-1 justify-end">
              <div className="">
                <Link href={`/owners/${tag.owner.id}`} className="link link-primary">
                  {tag.owner.ens ? tag.owner.ens : Truncate(tag.owner.id)}
                </Link>
              </div>
              <CopyAndPaste value={tag.owner.id} />
            </div>
          </div>
        </Panel>
        <Panel title={t("revenue")}>
          <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
            <div className="font-semibold">{t("tagging-records")}</div>
            <div className="text-right">
              <div className="">{tag.tagAppliedInTaggingRecord}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
            <div className="font-semibold">{t("creator")}</div>
            <div className="text-right">
              <div className="">
                {toEth(tag.creatorRevenue, 8)} {chain?.nativeCurrency.symbol}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
            <div className="font-semibold">{t("owner")}</div>
            <div className="text-right">
              <div className="">
                {toEth(tag.ownerRevenue, 8)} {chain?.nativeCurrency.symbol}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
            <div className="font-semibold">{t("relayer")}</div>
            <div className="text-right">
              <div className="">
                {toEth(tag.relayerRevenue, 8)} {chain?.nativeCurrency.symbol}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
            <div className="font-semibold">{t("protocol")}</div>
            <div className="text-right">
              <div className="">
                {toEth(tag.protocolRevenue, 8)} {chain?.nativeCurrency.symbol}
              </div>
            </div>
          </div>
        </Panel>
      </section>
      <div className="col-span-12">
        <TaggingRecords
          filter={taggingRecordsFilter}
          title={t("tag-tagging-records", {
            tag: tag.display,
          })}
        />
      </div>
    </Layout>
  );
};

export default Tag;

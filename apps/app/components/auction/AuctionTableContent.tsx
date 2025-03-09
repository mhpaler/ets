import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import { useCtags } from "@app/hooks/useCtags";
import { useSystem } from "@app/hooks/useSystem";
import type { TagType } from "@app/types/tag";
import { type FC, useMemo } from "react";
import { TanstackTable } from "../TanstackTable";

interface AuctionTableContentProps {
  type: "active" | "upcoming" | "settled";
  columns: any;
}

const AuctionTableContent: FC<AuctionTableContentProps> = ({ type, columns }) => {
  const { allAuctions } = useAuctionHouse();
  const { platformAddress } = useSystem();
  const { tags = [] } = useCtags({
    skip: 0,
    orderBy: "tagAppliedInTaggingRecord",
    filter: { owner_: { id: platformAddress.toLowerCase() } },
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    },
  });

  const filterEligibleTags = (tags: TagType[]): TagType[] => {
    return tags.filter(
      (tag) => !tag.auctions || tag.auctions.length === 0 || tag.auctions.every((auction) => auction.settled),
    );
  };

  const upcomingTags = filterEligibleTags(tags as TagType[]).sort((a, b) => {
    const tagAppliedA = a.tagAppliedInTaggingRecord ?? Number.NEGATIVE_INFINITY;
    const tagAppliedB = b.tagAppliedInTaggingRecord ?? Number.NEGATIVE_INFINITY;

    if (tagAppliedA === tagAppliedB) {
      return a.timestamp - b.timestamp;
    }
    return tagAppliedB - tagAppliedA;
  });

  const settledAuctions = useMemo(() => allAuctions.filter((auction) => auction.settled), [allAuctions]);
  const activeAuctions = useMemo(
    () =>
      allAuctions.filter((auction) => auction.startTime === 0 || auction.settled === false).sort((a, b) => b.id - a.id),
    [allAuctions],
  );

  let data: any;
  let loading: boolean;
  let rowLink: (item: any) => string;

  switch (type) {
    case "active":
      data = activeAuctions;
      loading = !activeAuctions.length;
      rowLink = (auction) => `/explore/ctags/${auction.tag.machineName}`;
      break;
    case "upcoming":
      data = upcomingTags;
      loading = !upcomingTags.length;
      rowLink = (tag) => `/explore/ctags/${tag.machineName}`;
      break;
    case "settled":
      data = settledAuctions;
      loading = !settledAuctions.length;
      rowLink = (auction) => `/explore/ctags/${auction.tag.machineName}`;
      break;
  }

  return <TanstackTable columns={columns} data={data} loading={loading} rowLink={rowLink} />;
};

export default AuctionTableContent;

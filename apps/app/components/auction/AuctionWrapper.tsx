import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import { Auction } from "@app/types/auction";
import useTranslation from "next-translate/useTranslation";
import AuctionDisplay from "@app/components/auction/AuctionDisplay";
import AuctionDebug from "@app/components/auction/AuctionDebug";

const AuctionWrapper = () => {
  const { t } = useTranslation("common");
  const auctionHouse = useAuctionHouse();
  if (!auctionHouse) return null;
  const { currentAuctionId, onDisplayAuction, maxAuctions, timeBuffer, duration } = auctionHouse;
  const loadingAuction = <div>Loading auction</div>;
  const currentAuctionActivityContent = onDisplayAuction && currentAuctionId && (
    <AuctionDisplay
      onDisplayAuction={onDisplayAuction}
      isFirstAuction={onDisplayAuction.id == 1}
      isLastAuction={onDisplayAuction.id == currentAuctionId}
    />
  );

  return (
    <>
      {currentAuctionActivityContent ? currentAuctionActivityContent : loadingAuction}
      <AuctionDebug />
    </>
  );
};

export default AuctionWrapper;

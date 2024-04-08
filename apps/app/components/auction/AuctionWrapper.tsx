import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import { AuctionProvider } from "@app/context/AuctionContext";
import AuctionDisplay from "@app/components/auction/AuctionDisplay";
import AuctionDebug from "@app/components/auction/AuctionDebug";
import { useAuction } from "@app/hooks/useAuctionContext";

const AuctionWrapper = () => {
  const { auction } = useAuction();
  const { maxAuctionId } = useAuctionHouse();

  const loadingAuction = (
    <div className="flex flex-col gap-4 w-full">
      <div className="skeleton h-32 w-full"></div>
      <div className="skeleton h-4 w-28"></div>
      <div className="skeleton h-4 w-full"></div>
      <div className="skeleton h-4 w-full"></div>
    </div>
  );
  //const currentAuctionId = auction?.id ?? null;
  const currentAuctionContent = auction && maxAuctionId && <AuctionDisplay />;

  return (
    <>
      {currentAuctionContent ? currentAuctionContent : loadingAuction}
      {/* {loadingAuction} */}
      <AuctionDebug />
    </>
  );
};

export default AuctionWrapper;

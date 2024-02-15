import { Auction, useAuctionHouse } from "@app/hooks/useAuctionHouse";
import AuctionDisplay from "@app/components/AuctionDisplay";
import useTranslation from "next-translate/useTranslation";

// Define the DebugOnDisplayAuction component directly within the same file
const DebugOnDisplayAuction: React.FC<{ onDisplayAuction: Auction }> = ({ onDisplayAuction }) => {
  // Custom replacer function that converts BigInt to strings
  const replacer = (key: any, value: any) => (typeof value === "bigint" ? value.toString() + "n" : value); // Append "n" to differentiate BigInt from Number

  return (
    <div className="col-span-12" style={{ whiteSpace: "pre-wrap" }}>
      <h3>Debugging onDisplayAuction:</h3>
      <code>{JSON.stringify(onDisplayAuction, replacer, 2)}</code>
    </div>
  );
};

const AuctionWrapper = () => {
  const { t } = useTranslation("common");
  const auctionHouse = useAuctionHouse();
  if (!auctionHouse) return null;
  const { currentAuctionId, onDisplayAuction } = auctionHouse;
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

      {onDisplayAuction && <DebugOnDisplayAuction onDisplayAuction={onDisplayAuction} />}
    </>
  );
};

export default AuctionWrapper;

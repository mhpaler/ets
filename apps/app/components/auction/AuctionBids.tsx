import useTranslation from "next-translate/useTranslation";
import { Auction } from "@app/types/auction";
import BidsTable from "@app/components/auction/BidsTable";
import { Modal } from "@app/components/Modal";

interface Props {
  onDisplayAuction: Auction;
}

const AuctionBids: React.FC<Props> = ({ onDisplayAuction }) => {
  const { t } = useTranslation("common");

  // Only show the button if the auction has started
  if (onDisplayAuction.startTime === 0) {
    return null;
  }

  // Determine if the auction has started and not ended
  const showLimitedBids = onDisplayAuction.startTime > 0 && !onDisplayAuction.ended;

  return (
    <>
      {showLimitedBids && (
        // Display a BidsTable with a limit of 3 records before the modal
        <BidsTable bids={onDisplayAuction.bids} limit={3} />
      )}
      <Modal label={t("view-all-bids")} link>
        <div className="overflow-x-auto">
          <div className="leading-3 prose mb-4">
            <span className="text-sm italic">{t("AUCTION.BIDS-FOR")}</span>
            <h1 className="p-0 m-0">{onDisplayAuction.tag.display}</h1>
          </div>
          {/* Display the full BidsTable within the modal */}
          <BidsTable bids={onDisplayAuction.bids} />
        </div>
      </Modal>
    </>
  );
};

export default AuctionBids;

import BidsTable from "@app/components/auction/BidsTable";
import { Button } from "@app/components/Button";
import { Modal } from "@app/components/Modal";
import { useModal } from "@app/hooks/useModalContext";
import type { Auction } from "@app/types/auction";
import useTranslation from "next-translate/useTranslation";

interface Props {
  auction: Auction;
}

const AuctionBids: React.FC<Props> = ({ auction }) => {
  const { t } = useTranslation("common");
  const { closeModal } = useModal();

  // Only show the button if the auction has started
  if (auction.startTime === 0) {
    return null;
  }

  // unique modal identifier based on auction
  const modalId = `auction-bids-${auction.id}`;
  // Determine if the auction has started and not ended
  const showLimitedBids = auction.startTime > 0 && !auction.ended;

  return (
    <>
      {showLimitedBids && (
        // Display a BidsTable with a limit of 3 records before the modal
        <BidsTable bids={auction.bids} limit={3} />
      )}
      <Modal id={modalId} label={t("view-all-bids")} link>
        <div className="leading-3 prose mb-4">
          <span className="text-sm">{t("AUCTION.BIDS_FOR")}</span>
          <h1 className="p-0 m-0">{auction.tag.display}</h1>
        </div>
        {/* Display the full BidsTable within the modal */}
        <BidsTable bids={auction.bids} />
        <div className="flex justify-center pt-4">
          <Button type="button" className="btn-outline btn-primary btn-sm" onClick={closeModal}>
            {t("close")}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default AuctionBids;

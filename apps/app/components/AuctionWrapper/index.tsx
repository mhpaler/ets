import { Auction, useAuctionHouse } from "../../hooks/useAuctionHouse";
import AuctionActivity from "../AuctionActivity";
import { TagGraphic } from "../TagGraphic";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";

interface AuctionProps {
  auctionId?: Number;
}

const AuctionWrapper: React.FC<AuctionProps> = (props) => {
  const { auctionId: requestedAuctionId } = props;
  const { t } = useTranslation("common");

  const auctionHouse = useAuctionHouse();
  if (!auctionHouse) return null;

  const { currentAuctionId, currentAuction } = auctionHouse;

  //  const history = useHistory();
  //  const dispatch = useAppDispatch();
  //
  //  let stateBgColor = useAppSelector(
  //    (state) => state.application.stateBackgroundColor
  //  );
  //  const lastNounId = useAppSelector(
  //    (state) => state.onDisplayAuction.lastAuctionNounId
  //  );
  //
  //  const loadedNounHandler = (seed: INounSeed) => {
  //    dispatch(setStateBackgroundColor(seed.background === 0 ? grey : beige));
  //  };
  //
  //  const prevAuctionHandler = () => {
  //    dispatch(setPrevOnDisplayAuctionNounId());
  //    currentAuction && history.push(`/auction/${currentAuction.auctionId - 1}`);
  //  };
  //  const nextAuctionHandler = () => {
  //    dispatch(setNextOnDisplayAuctionNounId());
  //    currentAuction && history.push(`/auction/${currentAuction.auctionId + 1}`);
  //  };

  const tagGraphic = currentAuction && (
    <TagGraphic tagId={currentAuction.tokenId} />
  );

  const loadingTag = <div>Loading tag</div>;

  const loadingAuction = <div>Loading auction</div>;

  const currentAuctionActivityContent = currentAuction && currentAuctionId && (
    <AuctionActivity
      auction={currentAuction}
      isFirstAuction={currentAuction.auctionId == 0}
      isLastAuction={currentAuction.auctionId == currentAuctionId}
      //onPrevAuctionClick={prevAuctionHandler}
      //onNextAuctionClick={nextAuctionHandler}
      //displayGraphDepComps={true}
    />
  );

  return (
    <>
      <div>
        <div></div>
        <div>
          {currentAuction && currentAuctionActivityContent
            ? currentAuctionActivityContent
            : ""}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 md:grid-cols-2">
        <div>{currentAuction ? tagGraphic : loadingTag}</div>
      </div>
    </>
  );
};

export default AuctionWrapper;

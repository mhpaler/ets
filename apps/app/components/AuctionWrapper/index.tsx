import { Auction, useAuctionHouse } from "../../hooks/useAuctionHouse";
import AuctionActivity from "../AuctionActivity";
import { TagGraphic } from "../TagGraphic";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";

const AuctionWrapper = () => {
  const { t } = useTranslation("common");

  const auctionHouse = useAuctionHouse();
  if (!auctionHouse) return null;

  const { currentAuctionId, onDisplayAuction } = auctionHouse;

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
  //    onDisplayAuction && history.push(`/auction/${onDisplayAuction.auctionId - 1}`);
  //  };
  //  const nextAuctionHandler = () => {
  //    dispatch(setNextOnDisplayAuctionNounId());
  //    onDisplayAuction && history.push(`/auction/${onDisplayAuction.auctionId + 1}`);
  //  };

  const tagGraphic = onDisplayAuction && (
    <TagGraphic tagId={Number(onDisplayAuction.tokenId)} />
  );

  const loadingTag = <div>Loading tag</div>;

  const loadingAuction = <div>Loading auction</div>;

  const currentAuctionActivityContent = onDisplayAuction &&
    currentAuctionId && (
      <AuctionActivity
        auction={onDisplayAuction}
        isFirstAuction={onDisplayAuction.auctionId == 0}
        isLastAuction={onDisplayAuction.auctionId == currentAuctionId}
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
          {onDisplayAuction && currentAuctionActivityContent
            ? currentAuctionActivityContent
            : ""}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 md:grid-cols-2">
        <div>{onDisplayAuction ? tagGraphic : loadingTag}</div>
      </div>
    </>
  );
};

export default AuctionWrapper;

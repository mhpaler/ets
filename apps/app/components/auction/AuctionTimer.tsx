import React, { useEffect, useState } from "react";
import useTranslation from "next-translate/useTranslation";
import { Auction } from "@app/types/auction";
import { useAuctionHouse } from "@app/hooks/useAuctionHouse";

interface AuctionTimerProps {
  onDisplayAuction: Auction;
}

const AuctionTimer: React.FC<AuctionTimerProps> = ({ onDisplayAuction }) => {
  const { t } = useTranslation("common");
  const { blockchainTime } = useAuctionHouse(); // Use the context to get the function

  const [timeLeft, setTimeLeft] = useState<number>(onDisplayAuction.endTime - blockchainTime());

  useEffect(() => {
    const updateTimer = () => {
      const newTimeLeft = onDisplayAuction.endTime - blockchainTime();

      if (newTimeLeft > 0) {
        setTimeLeft(newTimeLeft);
      } else {
        setTimeLeft(0);
        clearInterval(timer);
      }
    };

    const timer = setInterval(updateTimer, 1000);

    // Initial update in case the component mounts close to the end time
    updateTimer();

    return () => clearInterval(timer);
  }, [onDisplayAuction.endTime]);

  const formatTimeLeft = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div>
      <div>{t("AUCTION.TIME_LEFT")}</div>
      <div className="text-2xl font-semibold">
        {onDisplayAuction.startTime === 0 ? (
          <div>{t("AUCTION.BID_TO_START")}</div>
        ) : onDisplayAuction.ended ? (
          <div>{t("AUCTION.ENDED")}</div>
        ) : (
          <div>{formatTimeLeft(timeLeft)}</div>
        )}
      </div>
    </div>
  );
};

export default AuctionTimer;

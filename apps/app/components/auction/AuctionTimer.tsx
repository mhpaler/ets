import React, { useEffect, useState } from "react";
import useTranslation from "next-translate/useTranslation";
import { Auction } from "@app/types/auction";
import { useSystem } from "@app/hooks/useSystem";
import { useAuction } from "@app/hooks/useAuctionContext";

interface AuctionTimerProps {
  auction: Auction;
}

const AuctionTimer: React.FC<AuctionTimerProps> = ({ auction }) => {
  const { t } = useTranslation("common");
  const { blockchainTime } = useSystem();
  const { endAuction, setAuctionEndTimeUI } = useAuction();
  const [timeLeft, setTimeLeft] = useState<number>(auction.endTime - blockchainTime());

  useEffect(() => {
    const updateTimer = () => {
      const currentTime = blockchainTime();
      const hasStarted = auction.startTime > 0 && currentTime >= auction.startTime;
      const hasEnded = auction.endTime > 0 && currentTime > auction.endTime;

      // Update time left only if the auction has started
      if (hasStarted && !hasEnded) {
        const newTimeLeft = auction.endTime - currentTime;
        setTimeLeft(newTimeLeft);
      } else if (hasEnded) {
        setTimeLeft(0);
        clearInterval(timer);
        if (!auction.ended) {
          endAuction(auction.id); // Call endAuction only if it hasn't been marked as ended yet
          setAuctionEndTimeUI(currentTime);
        }
      }
    };

    const timer = setInterval(updateTimer, 1000);

    // Initial update in case the component mounts close to the end time or after
    updateTimer();

    return () => clearInterval(timer);
    // Ensure to include all dependencies this effect uses
  }, [auction.id, auction.startTime, auction.endTime, auction.ended, endAuction, blockchainTime, setAuctionEndTimeUI]);

  const formatTimeLeft = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div>
      <div>{t("AUCTION.TIME_LEFT")}</div>
      <div className="text-2xl font-semibold">
        {auction.startTime === 0 ? (
          <div>{t("AUCTION.BID_TO_START")}</div>
        ) : auction.ended ? (
          <div>{t("AUCTION.ENDED")}</div>
        ) : (
          <div>{formatTimeLeft(timeLeft)}</div>
        )}
      </div>
    </div>
  );
};

export default AuctionTimer;

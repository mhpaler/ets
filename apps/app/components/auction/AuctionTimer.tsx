import React, { useEffect, useState } from "react";
import useTranslation from "next-translate/useTranslation";
import { Auction } from "@app/types/auction";
import { useSystem } from "@app/hooks/useSystem";
import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import { useAuction } from "@app/hooks/useAuctionContext";

interface AuctionTimerProps {
  auction: Auction;
}

const AuctionTimer: React.FC<AuctionTimerProps> = ({ auction }) => {
  const { t } = useTranslation("common");
  const { blockchainTime } = useSystem();
  const { timeBuffer } = useAuctionHouse();
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

    // TODO: When concurrent auctions increases > 100, consider some type of
    // throttling mechanism. eg:
    ///const interval = timeLeft <= timeBuffer ? 1000 : 60000; // 1 second or 1 minute
    const interval = 1000; // 1 second
    const timer = setInterval(updateTimer, interval);

    // Initial update in case the component mounts close to the end time or after
    updateTimer();

    return () => clearInterval(timer);
    // Ensure to include all dependencies this effect uses
  }, [auction.id, auction.startTime, auction.endTime, auction.ended, endAuction, blockchainTime, setAuctionEndTimeUI]);

  const formatTimeLeft = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div>
      {auction.startTime === 0 ? (
        <div>{t("AUCTION.BID_TO_START")}</div>
      ) : auction.ended ? (
        <div>{t("AUCTION.ENDED")}</div>
      ) : (
        <div>{formatTimeLeft(timeLeft)}</div>
      )}
    </div>
  );
};

export default AuctionTimer;

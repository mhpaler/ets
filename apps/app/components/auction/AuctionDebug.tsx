import React, { useEffect, useState } from "react";
import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import { useAuction } from "@app/hooks/useAuctionContext";
import { useSystem } from "@app/hooks/useSystem";
import { bigIntReplacer } from "@app/utils";

const AuctionDebug = () => {
  const { timeDifference, blockchainTime } = useSystem();
  const { maxAuctionId, auctionPaused, maxAuctions, timeBuffer, duration } = useAuctionHouse();
  const { auction, auctionEndTimeUI } = useAuction();
  const [timeDifferenceMessage, setTimeDifferenceMessage] = useState<string>("");

  useEffect(() => {
    const fetchBlockchainTime = async () => {
      try {
        // Determine if local time is ahead or behind blockchain time and by how many seconds
        let message = "Local time and blockchain time are synchronized.";
        if (timeDifference > 0) {
          message = `Local time is ${timeDifference} seconds ahead of blockchain time.`;
        } else if (timeDifference < 0) {
          message = `Local time is ${Math.abs(timeDifference)} seconds behind blockchain time.`;
        }

        setTimeDifferenceMessage(message);
      } catch (error) {
        console.error("Failed to fetch blockchain time:", error);
      }
    };

    // Call the function immediately to get the initial values
    fetchBlockchainTime();

    // Set up an interval to fetch the time every 5 seconds
    const intervalId = setInterval(() => {
      fetchBlockchainTime();
    }, 5000); // 5000 milliseconds = 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [timeDifference]);

  return (
    <div className="col-span-12 prose" style={{ whiteSpace: "pre-wrap" }}>
      <h3>Blockchain Time Debugging</h3>
      <pre>
        Local Machine Time: {Math.floor(Date.now() / 1000)}
        <br />
        BlockchainTime: {blockchainTime()}
        <br />
        {timeDifferenceMessage}
        <br />
        Auction end time: {auction?.endTime}
        <br />
        Auction end time UI: {auctionEndTimeUI}
      </pre>
      <h3>Auction Settings</h3>
      <pre>
        Auction Paused: {auctionPaused ? "yes" : "no"}
        <br />
        Max Auction Id: {maxAuctionId}
        <br />
        Max Auctions: {maxAuctions}
        <br />
        Time Buffer: {timeBuffer} seconds
        <br />
        Duration: {duration} seconds
      </pre>
      <h3>auction:</h3>
      <pre>{JSON.stringify(auction, bigIntReplacer, 2)}</pre>
    </div>
  );
};

export default AuctionDebug;

import React, { useEffect, useState } from "react";
import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import { fetchBlockchainTimeDifference } from "@app/services/auctionHouseService";
import { bigIntReplacer } from "@app/utils";

const AuctionDebug = () => {
  const auctionHouse = useAuctionHouse();
  const { onDisplayAuction, maxAuctions, timeBuffer, duration, currentAuctionId } = auctionHouse;
  const [timeDifferenceMessage, setTimeDifferenceMessage] = useState<string>("");

  useEffect(() => {
    const fetchBlockchainTime = async () => {
      try {
        // Fetch the latest block
        const difference = await fetchBlockchainTimeDifference();

        // Determine if local time is ahead or behind blockchain time and by how many seconds
        let message = "Local time and blockchain time are synchronized.";
        if (difference > 0) {
          message = `Local time is ${difference} seconds ahead of blockchain time.`;
        } else if (difference < 0) {
          message = `Local time is ${Math.abs(difference)} seconds behind blockchain time.`;
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
  }, []);

  return (
    <div className="col-span-12 prose" style={{ whiteSpace: "pre-wrap" }}>
      <h3>Blockchain Time Debugging</h3>
      <pre>
        Local Machine Time: {Math.floor(Date.now() / 1000)}
        <br />
        {timeDifferenceMessage}
      </pre>
      <h3>Auction Settings</h3>
      <pre>
        Current Auction Id: {currentAuctionId}
        <br />
        Max Auctions: {maxAuctions}
        <br />
        Time Buffer: {timeBuffer} seconds
        <br />
        Duration: {duration} seconds
      </pre>
      <h3>onDisplayAuction:</h3>
      <pre>{JSON.stringify(onDisplayAuction, bigIntReplacer, 2)}</pre>
    </div>
  );
};

export default AuctionDebug;

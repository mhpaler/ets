// AuctionNavigation.tsx
import Link from "next/link";

interface AuctionNavigationProps {
  onDisplayAuctionId: number; // Add this line
  isFirstAuction: boolean;
  isLastAuction: boolean;
}

const AuctionNavigation: React.FC<AuctionNavigationProps> = ({ onDisplayAuctionId, isFirstAuction, isLastAuction }) => {
  const prevAuctionId = onDisplayAuctionId - 1;
  const nextAuctionId = onDisplayAuctionId + 1;
  return (
    <div className="flex col-span-12 items-center gap-2">
      <div>
        <Link href={`/auction/${prevAuctionId}`} legacyBehavior>
          <button className={`btn btn-sm btn-circle btn-outline ${isFirstAuction ? "btn-disabled" : ""}`}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M10.25 6.75L4.75 12L10.25 17.25"
              ></path>
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M19.25 12H5"
              ></path>
            </svg>
          </button>
        </Link>
      </div>
      <div>
        <Link href={`/auction/${nextAuctionId}`} legacyBehavior>
          <button className={`btn btn-sm btn-circle btn-outline ${isLastAuction ? "btn-disabled" : ""}`}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M13.75 6.75L19.25 12L13.75 17.25"
              ></path>
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M19 12H4.75"
              ></path>
            </svg>
          </button>
        </Link>
      </div>
      {/* Displaying the current auction ID */}
      <div className="font-bold">Auction #{onDisplayAuctionId}</div>
    </div>
  );
};

export default AuctionNavigation;

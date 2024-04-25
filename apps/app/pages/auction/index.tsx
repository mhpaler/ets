import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Layout from "@app/layouts/default";

import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import { Auctions } from "@app/components/Auctions";
// TODO: Think about turning html tables into Div tables.
// import { AuctionsDiv } from "@app/components/AuctionsDiv";
import { toEth } from "@app/utils";
import { Truncate } from "@app/components/Truncate";
import { TimeAgo } from "@app/components/TimeAgo";
import { Tag } from "@app/components/Tag";
import Link from "next/link.js";

import { useAccount } from "wagmi";
import { TransactionType } from "@app/types/transaction";
import { Modal } from "@app/components/Modal";
import { ConnectButtonETS } from "@app/components/ConnectButtonETS";
import TransactionFlowWrapper from "@app/components/transaction/TransactionFlowWrapper";

import { AuctionProvider } from "@app/context/AuctionContext";
import AuctionActions from "@app/components/auction/AuctionActions";
import { AuctionHouseProvider } from "@app/context/AuctionHouseContext";

const Auction: NextPage = () => {
  const { t } = useTranslation("common");
  const { activeAuctions } = useAuctionHouse();

  return (
    <Layout>
      <div className="col-span-12">
        <h2>Active</h2>
        <AuctionHouseProvider>
          <Auctions
            filter={{
              or: [{ startTime: 0 }, { settled: false }],
            }}
            columnsConfig={[
              {
                title: "#",
                field: "id",
                formatter: (id) => (
                  <Link className="link-primary block" href={`/auction/${id}`}>
                    {id}
                  </Link>
                ),
              },
              { title: "tag", field: "tag", formatter: (tag) => <Tag tag={tag} /> },
              { title: "current bid", field: "amount", formatter: (value) => `${toEth(value, 4)}` },
              { title: "bidder", field: "bidder.id", formatter: Truncate },
              { title: "time left", field: "endTime", formatter: (value) => <TimeAgo date={value * 1000} /> },
              {
                title: "",
                field: "id",
                formatter: (auction) => (
                  <AuctionProvider auctionId={Number(auction.id)}>
                    <AuctionActions auction={auction} />
                  </AuctionProvider>
                ),
              },
            ]}
          />
        </AuctionHouseProvider>
      </div>

      <div className="col-span-12">
        <h2>Upcoming</h2>
      </div>
      <div className="col-span-12">
        <h2>Settled</h2>
        <Auctions
          filter={{ settled: true }}
          columnsConfig={[
            {
              title: "#",
              field: "id",
              formatter: (id) => (
                <Link className="link-primary block" href={`/auction/${id}`}>
                  {id}
                </Link>
              ),
            },
            { title: "tag", field: "tag", formatter: (tag) => <Tag tag={tag} /> },
            { title: "price", field: "amount", formatter: (value) => `${toEth(value, 4)}` },
            { title: "winner", field: "bidder.id", formatter: Truncate },
            { title: "ended", field: "endTime", formatter: (value) => <TimeAgo date={value * 1000} /> },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Auction;

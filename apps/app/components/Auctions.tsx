import React, { useState } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { Auction } from "@app/types/auction";
import { AuctionProvider } from "@app/context/AuctionContext";
import useTranslation from "next-translate/useTranslation";
import { useModal } from "@app/hooks/useModalContext"; // Adjust the import path as necessary
import { globalSettings } from "@app/config/globalSettings";
import { Table } from "@app/components/Table";

type ColumnConfig = {
  title: string; // The display name of the column
  field: string; // The field in the auction data object
  formatter?: (value: any, auction: Auction) => JSX.Element | string; // Optional formatter function, now includes the whole auction as a parameter
};

type Props = {
  listId: string;
  title?: string;
  pageSize?: number;
  auctions: Auction[];
  //filter?: any;
  //orderBy?: string;
  columnsConfig: ColumnConfig[];
  rowLink: boolean; // Function to generate link URL based on auction data
};

const Auctions: NextPage<Props> = ({
  listId,
  title,
  auctions,
  pageSize = globalSettings["DEFAULT_PAGESIZE"],
  //filter,
  //orderBy,
  columnsConfig,
  rowLink = false, // Default to false if not provided
}) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [skip, setSkip] = useState(0);
  const { isModalOpen } = useModal();

  //console.log("Auctions", auctions);
  const nextPage = () => setSkip(skip + pageSize);
  const prevPage = () => setSkip(skip - pageSize);

  function getValueByPath<T>(obj: T, path: string): any {
    return path.split(".").reduce<any>((acc, part) => acc && acc[part], obj);
  }

  const handleRowClick = (auctionId: number) => {
    console.log(`handleRowClick: Modal Open?: ${isModalOpen}, Auction Id: ${auctionId}`);
    if (!isModalOpen && rowLink) {
      // Only navigate if the modal is not open
      router.push(`/auction/${auctionId}`);
    }
  };

  return (
    <div className="col-span-12">
      {title && <h2 className="text-2xl font-bold pb-4">{title}</h2>}
      <Table loading={!auctions} rows={pageSize}>
        <Table.Head>
          <Table.Tr>
            {columnsConfig.map((column, index) => (
              <Table.Th key={`${listId}-${column.title}-${index}`}>{t(column.title)}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Head>
        <Table.Body>
          {auctions?.map((auction) => (
            <AuctionProvider key={auction.id} auctionId={auction.id}>
              <Table.Tr
                key={`${listId}-${auction.id}`}
                onClick={rowLink ? () => handleRowClick(auction.id) : undefined}
              >
                {columnsConfig.map((column, index) => (
                  <Table.Cell key={`${listId}-${auction.id}-${index}-${column.field}`}>
                    {column.formatter
                      ? column.formatter(getValueByPath(auction, column.field), auction) // Pass the whole auction object
                      : getValueByPath(auction, column.field)}
                  </Table.Cell>
                ))}
              </Table.Tr>
            </AuctionProvider>
          ))}
        </Table.Body>
        {/* {nextAuctions?.length > 0 || skip !== 0 ? (
          <Table.Footer>
            <tr>
              <td className="flex justify-between">
                <Button disabled={skip === 0} onClick={prevPage}>
                  {t("prev")}
                </Button>
                <Button disabled={!nextAuctions || nextAuctions.length === 0} onClick={nextPage}>
                  {t("next")}
                </Button>
              </td>
            </tr>
          </Table.Footer>
        ) : null} */}
      </Table>
    </div>
  );
};

export { Auctions };

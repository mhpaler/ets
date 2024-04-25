import React, { useState } from "react";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import { Auction } from "@app/types/auction";
import { globalSettings } from "@app/config/globalSettings";
import { useAuctions } from "@app/hooks/useAuctions";
import { Table } from "@app/components/Table";
import { Button } from "@app/components/Button";

type ColumnConfig = {
  title: string; // The display name of the column
  field: string; // The field in the auction data object
  formatter?: (value: any, auction: Auction) => JSX.Element | string; // Optional formatter function, now includes the whole auction as a parameter
};

type Props = {
  filter?: any;
  pageSize?: number;
  orderBy?: string;
  title?: string;
  columnsConfig: ColumnConfig[];
};

const Auctions: NextPage<Props> = ({
  title,
  filter,
  pageSize = globalSettings["DEFAULT_PAGESIZE"],
  orderBy,
  columnsConfig,
}) => {
  const { t } = useTranslation("common");
  const [skip, setSkip] = useState(0);
  const { auctions, nextAuctions, isLoading } = useAuctions({
    filter: filter,
    pageSize: pageSize,
    orderBy: orderBy,
    skip,
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 3000,
    },
  });

  // TODO: Display auctions loading indicator
  /* if (isLoading) {
    console.log("Auctions are loading...");
  } else if (auctions) {
    console.log("Auctions loaded:", auctions);
  } */

  const nextPage = () => setSkip(skip + pageSize);
  const prevPage = () => setSkip(skip - pageSize);

  function getValueByPath<T>(obj: T, path: string): any {
    return path.split(".").reduce<any>((acc, part) => acc && acc[part], obj);
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Table loading={!auctions} rows={pageSize}>
        <Table.Head>
          <Table.Tr>
            {columnsConfig.map((column) => (
              <Table.Th key={column.title}>{t(column.title)}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Head>
        <Table.Body>
          {auctions?.map((auction) => (
            <Table.Tr key={auction.id}>
              {columnsConfig.map((column) => (
                <Table.Cell key={column.field}>
                  {column.formatter
                    ? column.formatter(getValueByPath(auction, column.field), auction) // Pass the whole auction object
                    : getValueByPath(auction, column.field)}
                </Table.Cell>
              ))}
            </Table.Tr>
          ))}
        </Table.Body>
        {nextAuctions?.length > 0 || skip !== 0 ? (
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
        ) : null}
      </Table>
    </div>
  );
};

export { Auctions };

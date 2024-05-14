import { useState } from "react";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import { globalSettings } from "@app/config/globalSettings";
import { useAuctions } from "../hooks/useAuctions";
import { DivTable, DivTableHead, DivTableRow, DivTableCell, DivTableBody } from "@app/components/DivTable";
import { Button } from "@app/components/Button";

type ColumnConfig = {
  title: string;
  field: string;
  formatter?: (value: any) => JSX.Element | string;
};

type Props = {
  filter?: any;
  pageSize?: number;
  orderBy?: string;
  title?: string;
  columnsConfig: ColumnConfig[];
};

const AuctionsDiv: NextPage<Props> = ({
  filter,
  pageSize = globalSettings["DEFAULT_PAGESIZE"],
  orderBy,
  columnsConfig,
}) => {
  const { t } = useTranslation("common");
  const [skip, setSkip] = useState(0);
  const { auctions, nextAuctions } = useAuctions({
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
      refreshInterval: 0,
    },
  });

  const nextPage = () => {
    setSkip(skip + pageSize);
  };

  const prevPage = () => {
    setSkip(skip - pageSize);
  };

  const showPrevNext = () => {
    return (nextAuctions && nextAuctions.length > 0) || (skip && skip !== 0);
  };

  function getValueByPath<T>(obj: T, path: string): any {
    return path.split(".").reduce<any>((acc, part) => acc && acc[part], obj);
  }

  return (
    <div className="max-w-7xl mx-auto">
      <DivTable loading={!auctions}>
        <DivTableHead>
          <DivTableRow>
            {columnsConfig.map((column) => (
              <DivTableCell key={column.title} isHeader={true}>
                {t(column.title)}
              </DivTableCell>
            ))}
          </DivTableRow>
        </DivTableHead>
        <DivTableBody>
          {auctions?.map((auction) => (
            <DivTableRow key={auction.id}>
              {columnsConfig.map((column) => (
                <DivTableCell key={column.field}>
                  {column.formatter
                    ? column.formatter(getValueByPath(auction, column.field))
                    : getValueByPath(auction, column.field)}
                </DivTableCell>
              ))}
            </DivTableRow>
          ))}
        </DivTableBody>
      </DivTable>
      {showPrevNext() && (
        <div className="flex justify-between my-4">
          <Button disabled={skip === 0} onClick={prevPage}>
            {t("prev")}
          </Button>
          <Button disabled={!nextAuctions || nextAuctions.length === 0} onClick={nextPage}>
            {t("next")}
          </Button>
        </div>
      )}
    </div>
  );
};

export { AuctionsDiv };

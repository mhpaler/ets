import { useState } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { useCtags } from "@app/hooks/useCtags";
import { globalSettings } from "@app/config/globalSettings";
import { Table } from "@app/components/Table";
import { Button } from "@app/components/Button";
import { TagType } from "@app/types/tag";

type ColumnConfig = {
  title: string; // The display name of the column
  field: string; // The field in the tag data object
  formatter?: (value: any, tag: TagType) => JSX.Element | string; // Optional formatter function, now includes the whole tag as a parameter
};

type Props = {
  filter?: any;
  pageSize?: number;
  orderBy?: string;
  title?: string;
  columnsConfig: ColumnConfig[];
  rowLink: boolean; // Function to generate link URL based on tag data
};

const Tags: NextPage<Props> = ({
  title,
  filter,
  pageSize = globalSettings["DEFAULT_PAGESIZE"],
  orderBy,
  columnsConfig,
  rowLink = false,
}) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [skip, setSkip] = useState(0);
  const { tags, nextTags, mutate } = useCtags({
    pageSize,
    skip,
    orderBy,
    filter: filter,
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 1500,
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

  const handleRowClick = (tagId: string) => {
    if (rowLink) {
      router.push(`/tag/${tagId}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Table loading={!tags} rows={pageSize}>
        {title && <Table.Title>{title}</Table.Title>}
        <Table.Head>
          <Table.Tr>
            {columnsConfig.map((column) => (
              <Table.Th key={column.title}>{t(column.title)}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Head>

        <Table.Body>
          {tags?.map((tag) => (
            <Table.Tr key={tag.id} onClick={rowLink ? () => handleRowClick(tag.id) : undefined}>
              {columnsConfig.map((column) => (
                <Table.Cell key={column.field}>
                  {column.formatter
                    ? column.formatter(getValueByPath(tag, column.field), tag) // Pass the whole tag object
                    : getValueByPath(tag, column.field)}
                </Table.Cell>
              ))}
            </Table.Tr>
          ))}
        </Table.Body>
        {nextTags?.length > 0 || skip !== 0 ? (
          <Table.Footer>
            <tr>
              <td className="flex justify-between">
                <Button disabled={skip === 0} onClick={prevPage}>
                  {t("prev")}
                </Button>
                <Button disabled={!nextTags || nextTags.length === 0} onClick={nextPage}>
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

export { Tags };

import { useMemo } from "react";
import Link from "next/link";
import { TimeAgo } from "../components/TimeAgo";
import useTranslation from "next-translate/useTranslation";
import { shorter } from "../utils";
import { useTaggingRecords } from "../hooks/useTaggingRecords";
import { Table } from "../components/Table";

const pageSize = 5;

const RecentlyTagged = () => {
  const { t } = useTranslation("common");
  const { taggingRecords } = useTaggingRecords({ pageSize: pageSize });

  const chainName: { [key: number]: string } = {
    1: "Ethereum",
    80001: "Polygon Mumbai",
  };

  const columns = useMemo(
    () => [
      "Target",
      t("ctags"),
      t("record-type"),
      t("date"),
      t("publisher"),
      t("tagger"),
    ],
    [t]
  );

  return (
    <div className="w-full mx-auto">
      <div className="rounded-md shadow-lg shadow-slate-400/20 ring-1 ring-slate-200">
        <Table loading={!taggingRecords} rows={pageSize}>
          <Table.Title>{t("latest-tagging-records")}</Table.Title>
          <Table.Head>
            <Table.Tr>
              {columns &&
                columns.map((column) => (
                  <Table.Th key={column}>{column}</Table.Th>
                ))}
            </Table.Tr>
          </Table.Head>
          <Table.Body>
            {taggingRecords &&
              taggingRecords.map((taggingRecord: any) => (
                <Table.Tr key={taggingRecord.id}>
                  <Table.Cell value={taggingRecord.target.targetURI} />
                  <Table.Cell
                    value={taggingRecord.tags.map((tag: any) => (
                      <ul>
                        <li>
                          <Link href={`/tags/${tag.machineName}`}>
                            <a className="text-pink-600 hover:text-pink-700">
                              {tag.display}
                            </a>
                          </Link>
                        </li>
                      </ul>
                    ))}
                  />
                  <Table.Cell value={taggingRecord.recordType} />
                  <Table.CellWithChildren>
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                      <TimeAgo date={taggingRecord.timestamp * 1000} />
                    </div>
                  </Table.CellWithChildren>
                  <Table.CellWithChildren>
                    <Link
                      href={`/publishers/${
                        taggingRecord && taggingRecord.publisher.id
                      }`}
                    >
                      <a className="text-pink-600 hover:text-pink-700">
                        {taggingRecord && taggingRecord.publisher.name}
                      </a>
                    </Link>
                  </Table.CellWithChildren>
                  <Table.Cell value={taggingRecord.tagger.id} copyAndPaste />
                </Table.Tr>
              ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

export { RecentlyTagged };

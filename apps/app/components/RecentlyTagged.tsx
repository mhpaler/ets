import { useMemo } from "react";
import Link from "next/link";
import { TimeAgo } from "../components/TimeAgo";
import useTranslation from "next-translate/useTranslation";
import { shorter } from "../utils";
import { useTaggingRecords } from "../hooks/useTaggingRecords";
import { Table } from "../components/Table";

const pageSize = 5;

const go = (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.5"
      d="M13.75 6.75L19.25 12L13.75 17.25"
    ></path>
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.5"
      d="M19 12H4.75"
    ></path>
  </svg>
);

const RecentlyTagged = () => {
  const { t } = useTranslation("common");
  const { taggingRecords } = useTaggingRecords({ pageSize: pageSize });

  const columns = useMemo(
    () => [
      t("date"),
      t("publisher"),
      t("tagger"),
      t("record-type"),
      t("target"),
      t("ctags"),
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
                  <Table.CellWithChildren>
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                      <Link
                        href={`/tagging-records/${
                          taggingRecord && taggingRecord.id
                        }`}
                      >
                        <a className="text-pink-600 hover:text-pink-700">
                          <TimeAgo date={taggingRecord.timestamp * 1000} />
                        </a>
                      </Link>
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
                  <Table.Cell value={taggingRecord.recordType} />

                  <Table.Cell value={taggingRecord.target.targetURI} />
                  <Table.Cell
                    value={taggingRecord.tags.map((tag: any) => (
                      <ul key={tag.id}>
                        <li>
                          <Link href={`/ctags/${tag.machineName}`}>
                            <a className="text-pink-600 hover:text-pink-700">
                              {tag.display}
                            </a>
                          </Link>
                        </li>
                      </ul>
                    ))}
                  />
                </Table.Tr>
              ))}
          </Table.Body>
          <Table.Footer>
            <div className="text-center">
              <Link href={`/tagging-records/`}>
                <a className="text-pink-600 hover:text-pink-700">
                  {t("view-all", { subject: t("tagging-records") })}
                </a>
              </Link>
            </div>
          </Table.Footer>
        </Table>
      </div>
    </div>
  );
};

export { RecentlyTagged };

import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import { useCtags } from "@app/hooks/useCtags";
import Layout from "@app/layouts/default";
import { Truncate } from "@app/components/Truncate";
import { TimeAgo } from "@app/components/TimeAgo";
import { Tag } from "@app/components/Tag";
import { useState, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { TanstackTable } from "@app/components/TanstackTable";
import { globalSettings } from "@app/config/globalSettings";
import { TagType } from "@app/types/tag";

const Ctags: NextPage = () => {
  const { t } = useTranslation("common");
  const [pageIndex, setPageIndex] = useState(0);
  const { tags = [], nextTags } = useCtags({
    skip: pageIndex * 20,
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 1500,
    },
  });

  const columnHelper = createColumnHelper<TagType>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("display", {
        header: () => "Tag",
        cell: (info) => <Tag tag={info.row.original} />,
      }),
      columnHelper.accessor("timestamp", {
        header: () => "Created",
        cell: (info) => <TimeAgo date={info.getValue() * 1000} />,
      }),
      columnHelper.accessor("owner.id", {
        header: () => t("owner"),
        cell: (info) => Truncate(info.getValue(), 13, "middle"),
      }),
      columnHelper.accessor("relayer.id", {
        header: () => t("relayer"),
        cell: (info) => Truncate(info.getValue(), 13, "middle"),
      }),
      columnHelper.accessor("tagAppliedInTaggingRecord", {
        header: () => "Tagging Records",
      }),
    ],
    [columnHelper, t],
  );

  return (
    <Layout>
      <div className="col-span-12">
        <TanstackTable
          columns={columns}
          data={tags}
          hasNextPage={!!nextTags?.length}
          loading={!tags?.length}
          rowsPerPage={globalSettings["DEFAULT_PAGESIZE"]}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
        />
      </div>
    </Layout>
  );
};

export default Ctags;

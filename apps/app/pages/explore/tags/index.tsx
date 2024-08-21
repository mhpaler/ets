import Address from "@app/components/Address";
import { Tag } from "@app/components/Tag";
import { TanstackTable } from "@app/components/TanstackTable";
import { TimeAgo } from "@app/components/TimeAgo";
import { Truncate } from "@app/components/Truncate";
import { globalSettings } from "@app/config/globalSettings";
import { useCtags } from "@app/hooks/useCtags";
import Layout from "@app/layouts/default";
import type { TagType } from "@app/types/tag";
import { createColumnHelper } from "@tanstack/react-table";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { useMemo, useState } from "react";

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
      columnHelper.accessor("owner", {
        header: () => t("owner"),
        cell: (info) => {
          const owner = info.getValue();
          return (
            <Link href={`/explore/owners/${owner.id}`} className="link link-primary">
              <Address address={owner.id} ens={owner.ens} />
            </Link>
          );
        },
      }),
      columnHelper.accessor("relayer.id", {
        header: () => t("relayer"),
        cell: (info) => (
          <Link href={`/explore/relayers/${info.getValue()}`} className="link link-primary">
            <Address address={info.getValue()} />
          </Link>
        ),
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
          rowsPerPage={globalSettings.DEFAULT_PAGESIZE}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
        />
      </div>
    </Layout>
  );
};

export default Ctags;

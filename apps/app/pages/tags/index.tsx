import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import { useCtags } from "@app/hooks/useCtags";
import Layout from "@app/layouts/default";
import { Truncate } from "@app/components/Truncate";
import { TimeAgo } from "@app/components/TimeAgo";
import { Tags } from "@app/components/Tags";
import { Tag } from "@app/components/Tag";
import { useState } from "react";

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

  return (
    <Layout>
      <div className="col-span-12">
        <Tags
          tags={tags}
          rowLink={false}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          hasNextPage={!!nextTags?.length}
          columnsConfig={[
            { title: "tag", field: "tag", formatter: (_: any, tag: any) => <Tag tag={tag} /> },
            {
              title: "created",
              field: "timestamp",
              formatter: (value: any, tag: any) => <TimeAgo date={value * 1000} />,
            },
            {
              title: t("owner"),
              field: "owner.id",
              formatter: (value: any, tag: any) => Truncate(value, 13, "middle"),
            },
            {
              title: t("relayer"),
              field: "relayer.id",
              formatter: (value: any, tag: any) => Truncate(value, 13, "middle"),
            },
            { title: "tagging records", field: "tagAppliedInTaggingRecord" },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Ctags;

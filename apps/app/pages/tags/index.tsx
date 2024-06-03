import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import { useCtags } from "@app/hooks/useCtags";
import Layout from "@app/layouts/default";
import { Truncate } from "@app/components/Truncate";
import { TimeAgo } from "@app/components/TimeAgo";
import { Tags } from "@app/components/Tags";
import { Tag } from "@app/components/Tag";

const Ctags: NextPage = () => {
  const { t } = useTranslation("common");
  const {
    tags = [],
    nextTags,
    mutate,
  } = useCtags({
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
          listId="tagsHome"
          title={t("newest-tags")}
          tags={tags}
          rowLink={false}
          columnsConfig={[
            { title: "tag", field: "tag", formatter: (_, tag) => <Tag tag={tag} /> },
            { title: "created", field: "timestamp", formatter: (value, tag) => <TimeAgo date={value * 1000} /> },
            { title: t("owner"), field: "owner.id", formatter: (value, tag) => Truncate(value, 13, "middle") },
            { title: t("relayer"), field: "relayer.id", formatter: (value, tag) => Truncate(value, 13, "middle") },
            { title: "tagging records", field: "tagAppliedInTaggingRecord" },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Ctags;

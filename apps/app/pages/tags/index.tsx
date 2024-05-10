import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Layout from "@app/layouts/default";
import { Truncate } from "@app/components/Truncate";
import { TimeAgo } from "@app/components/TimeAgo";
import { Tags } from "@app/components/Tags";
import { Tag } from "@app/components/Tag";

const Ctags: NextPage = () => {
  const { t } = useTranslation("common");

  return (
    <Layout>
      <div className="col-span-12">
        <Tags
          title={t("newest-tags")}
          rowLink={false}
          columnsConfig={[
            { title: "tag", field: "tag", formatter: (_, tag) => <Tag tag={tag} /> },
            { title: "created", field: "timestamp", formatter: (value, tag) => <TimeAgo date={value * 1000} /> },
            { title: t("owner"), field: "owner.id" },
            { title: "tagging records", field: "tagAppliedInTaggingRecord" },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Ctags;

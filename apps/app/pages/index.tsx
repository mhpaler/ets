import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Layout from "@app/layouts/default";
import { TaggingRecords } from "@app/components/TaggingRecords";
import { Stats } from "@app/components/Stats";

const Home: NextPage = () => {
  const { t } = useTranslation("common");

  return (
    <Layout>
      <Stats />
      <TaggingRecords title={t("latest-tagging-records")} />
    </Layout>
  );
};

export default Home;

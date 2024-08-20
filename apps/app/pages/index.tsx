import { Stats } from "@app/components/Stats";
import { TaggingRecords } from "@app/components/TaggingRecords";
import Layout from "@app/layouts/default";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";

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

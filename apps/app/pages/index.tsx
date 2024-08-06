import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Layout from "@app/layouts/default";
import { TaggingRecords } from "@app/components/TaggingRecords";
import { Stats } from "@app/components/Stats";

const Home: NextPage = () => {
  const { t } = useTranslation("common");

  return (
    <Layout>
      <div className="col-span-12 grid gap-y-12">
        <Stats />
        <div className="col-span-12 gap-6 md:grid-cols-1 lg:gap-12">
          <TaggingRecords title={t("latest-tagging-records")} />
        </div>
      </div>
    </Layout>
  );
};

export default Home;

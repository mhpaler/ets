import type { NextPage } from "next";
import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import { TaggingRecords } from "../../components/TaggingRecords";
import PageTitle from "../../components/PageTitle";

const RecentlyTagged: NextPage = () => {
  const { t } = useTranslation("common");
  return (
    <div className="max-w-6xl mx-auto mt-12">
      <Head>
        <title>{t("recently-tagged")} | Ethereum Tag Service</title>
      </Head>
      <PageTitle title={t("tagging-records")} />
      <TaggingRecords />
    </div>
  );
};

export default RecentlyTagged;

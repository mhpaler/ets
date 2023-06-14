import type { NextPage } from "next";
import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import { TaggingRecords } from "../../components/TaggingRecords";
import PageTitle from "../../components/PageTitle";

const RecentlyTagged: NextPage = () => {
  const { t } = useTranslation("common");
  const pageTitle = `${t("tagging-records")}`;
  const browserTitle = `${pageTitle} | ETS`;
  return (
    <div className="max-w-6xl mx-auto mt-12">
      <Head>
        <title>{browserTitle}</title>
      </Head>
      <PageTitle title={pageTitle} />
      <TaggingRecords />
    </div>
  );
};

export default RecentlyTagged;

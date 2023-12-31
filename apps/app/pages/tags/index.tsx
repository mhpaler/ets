import type { NextPage } from "next";
import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import { Tags } from "../../components/Tags";
import PageTitle from "../../components/PageTitle";

const Ctags: NextPage = () => {
  const { t } = useTranslation("common");
  const pageTitle = `${t("tags")}`;
  const browserTitle = `${pageTitle} | ETS`;

  return (
    <div className="max-w-7xl mx-auto mt-12">
      <Head>
        <title>{browserTitle}</title>
      </Head>

      <PageTitle title={pageTitle} />
      <Tags title={t("newest-tags")} />
    </div>
  );
};

export default Ctags;

import type { NextPage } from "next";
import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import { Tags } from "../../components/Tags";
import PageTitle from "../../components/PageTitle";

const Ctags: NextPage = () => {
  const { t } = useTranslation("common");

  return (
    <div className="max-w-6xl mx-auto mt-12">
      <Head>
        <title>{t("tags")} | Ethereum Tag Service</title>
      </Head>

      <PageTitle title={t("tags")} />
      <Tags title={t("newest-tags")} />
    </div>
  );
};

export default Ctags;

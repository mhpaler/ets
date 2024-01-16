import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Layout from "@app/layouts/default";
import { Tags } from "@app/components/Tags";

const Ctags: NextPage = () => {
  const { t } = useTranslation("common");

  return (
    <Layout>
      <div className="col-span-12">
        <Tags title={t("newest-tags")} />
      </div>
    </Layout>
  );
};

export default Ctags;

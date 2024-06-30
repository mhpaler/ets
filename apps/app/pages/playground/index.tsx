import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Layout from "@app/layouts/default";
import Link from "next/link";

const Playground: NextPage = () => {
  const { t } = useTranslation("common");

  return (
    <Layout>
      <div className="container mx-auto col-span-12">
        <ul className="list-disc pl-6">
          <li>
            <Link href="/playground/create-tag" className="link-primary">
              {t("create-tag")}
            </Link>
          </li>
          <li>
            <Link href="/playground/create-tagging-record" className="link-primary">
              {t("create-tagging-record")}
            </Link>
          </li>
        </ul>
      </div>
    </Layout>
  );
};

export default Playground;

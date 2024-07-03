import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Layout from "@app/layouts/default";
import Link from "next/link";

const Explore: NextPage = () => {
  const { t } = useTranslation("common");

  return (
    <Layout>
      <div className="container mx-auto col-span-12">
        <ul>
          <li>
            <Link className="link-primary" href="/explore/tagging-records">
              {t("tagging-records")}
            </Link>
          </li>
          <li>
            <Link className="link-primary" href="/explore/tags">
              {t("tags")}
            </Link>
          </li>
          <li>
            <Link className="link-primary" href="/explore/targets">
              {t("targets")}
            </Link>
          </li>
          <li>
            <Link className="link-primary" href="/explore/relayers">
              {t("relayers")}
            </Link>
          </li>
          <li>
            <Link className="link-primary" href="/explore/taggers">
              {t("taggers")}
            </Link>
          </li>
          <li>
            <Link className="link-primary" href="/explore/creators">
              {t("tag-creators")}
            </Link>
          </li>
          <li>
            <Link className="link-primary" href="/explore/owners">
              {t("tag-owners")}
            </Link>
          </li>
        </ul>
      </div>
    </Layout>
  );
};

export default Explore;

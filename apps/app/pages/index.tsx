import type { NextPage } from "next";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "./api/auth/[...nextauth]";

import { TaggingRecords } from "../components/TaggingRecords";
import useTranslation from "next-translate/useTranslation";
import { Stats } from "../components/Stats";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  return {
    props: {
      session: await getServerSession(req, res, getAuthOptions(req)),
    },
  };
};

const Home: NextPage = () => {
  const { t } = useTranslation("common");
  return (
    <div className="grid max-w-7xl gap-6 mx-auto mt-12 lg:gap-12 md:space-y-0 sm:w-full">
      <Stats />
      <div className="gap-6 md:grid-cols-1 lg:gap-12">
        <TaggingRecords title={t("latest-tagging-records")} />
      </div>
    </div>
  );
};

export default Home;

import type { NextPage } from "next";
import Layout from "@app/layouts/default";
import { TaggingRecords } from "@app/components/TaggingRecords";

const RecentlyTagged: NextPage = () => {
  return (
    <Layout>
      <TaggingRecords />
    </Layout>
  );
};

export default RecentlyTagged;

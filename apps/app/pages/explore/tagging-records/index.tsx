import { TaggingRecords } from "@app/components/TaggingRecords";
import Layout from "@app/layouts/default";
import type { NextPage } from "next";

const RecentlyTagged: NextPage = () => {
  return (
    <Layout>
      <TaggingRecords />
    </Layout>
  );
};

export default RecentlyTagged;

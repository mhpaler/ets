import type { NextPage } from "next";
import Layout from "@app/layouts/default";
import { TaggingRecords } from "@app/components/TaggingRecords";

const RecentlyTagged: NextPage = () => {
  return (
    <Layout>
      <div className="col-span-12">
        <TaggingRecords />
      </div>
    </Layout>
  );
};

export default RecentlyTagged;

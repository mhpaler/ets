import { Tags } from "@app/components/Tags";
import { useCtags } from "@app/hooks/useCtags";
import Layout from "@app/layouts/default";
import type { NextPage } from "next";
import { useState } from "react";

const Ctags: NextPage = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const {
    tags = [],
    nextTags,
    isLoading,
  } = useCtags({
    skip: pageIndex * 20,
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 30000,
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="loading loading-spinner loading-md" />{" "}
      </Layout>
    );
  }
  return (
    <Layout>
      <Tags
        //title="Tags"
        tags={tags}
        columns={["tag", "created", "owner", "relayer", "taggingRecords"]}
        rowLink={false}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        hasNextPage={!!nextTags?.length}
      />
    </Layout>
  );
};

export default Ctags;

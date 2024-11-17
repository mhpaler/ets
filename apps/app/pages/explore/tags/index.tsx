import { Tags } from "@app/components/Tags";
import { useCtags } from "@app/hooks/useCtags";
import Layout from "@app/layouts/default";
import type { NextPage } from "next";
import { useEffect, useState } from "react";

const Ctags: NextPage = () => {
  const [isClient, setIsClient] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    tags = [],
    nextTags,
    isLoading,
  } = useCtags({
    skip: pageIndex * 20,
  });

  return (
    <Layout>
      {isClient && (
        <Tags
          tags={tags}
          loading={isLoading}
          columns={["tag", "created", "taggingRecords", "totalRevenue"]}
          rowLink={true}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          hasNextPage={!!nextTags?.length}
        />
      )}
    </Layout>
  );
};

export default Ctags;

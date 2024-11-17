import { usePathToTitle } from "@app/hooks/usePathToTitle";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/**
 * PageTitle Component
 *
 * This component dynamically sets and displays the page title based on the current route.
 * It handles special cases for routes under "/explore" to format the title appropriately.
 */
const PageTitle = () => {
  const router = useRouter();
  const { t } = useTranslation("common");

  // If on the homepage, return nothing
  if (router.pathname === "/") {
    return null;
  }

  // Extract the segments or the query parameter if it's a dynamic route
  const pathSegments = router.pathname.split("/").filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1];
  const secondSegment = pathSegments[1];

  // Determine the dynamic segment value
  let dynamicSegmentValue = "";
  if (lastSegment) {
    dynamicSegmentValue = (router.query[lastSegment.slice(1, -1)] as string) || lastSegment;
  }

  // Use the custom hook to get the transformed label and loading state
  const { label, loading } = usePathToTitle(dynamicSegmentValue);

  // State for the page title
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!loading && label) {
      let formattedTitle = label;
      // Format the title for routes under "/explore" with a third segment
      if (pathSegments[0] === "explore" && pathSegments.length === 3) {
        const singularSecondSegment = secondSegment.endsWith("s") ? secondSegment.slice(0, -1) : secondSegment;
        formattedTitle = `${t(singularSecondSegment)}: ${label}`;
      }
      setTitle(formattedTitle);
    }
  }, [label, loading, t, pathSegments, secondSegment]);

  // Render nothing while loading
  if (loading || !title) {
    return null;
  }

  return (
    <>
      <div className="col-span-12">
        <h1 className="text-2xl font-medium">{title}</h1>
      </div>
      {/*{shareUrl && <Share url={shareUrl} />}*/}
    </>
  );
};

export default PageTitle;

import { Truncate } from "@app/components/Truncate";
import { useCtags } from "@app/hooks/useCtags";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/**
 * Custom hook to transform a path segment into a user-friendly title.
 *
 * @param {string} segment - The segment of the path to transform.
 * @returns {{ label: string, loading: boolean }} - An object containing the transformed label and loading state.
 */
export const usePathToTitle = (segment: string) => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const pathSegments = router.asPath.split("/").filter(Boolean);
  const segmentIndex = pathSegments.indexOf(segment);

  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  // Only fetch tag data if we're actually on a tag path
  const fetchTagDisplayName = segmentIndex === 2 && pathSegments[0] === "explore" && pathSegments[1] === "tags";

  // Conditionally call useCtags only when needed
  const { tags, isLoading } = fetchTagDisplayName
    ? useCtags({
        pageSize: 1,
        skip: 0,
        filter: { machineName: segment },
      })
    : { tags: null, isLoading: false };

  useEffect(() => {
    if (fetchTagDisplayName) {
      setLoading(true);
      if (tags && tags.length > 0) {
        setLabel(tags[0].display);
      } else {
        setLabel(segment);
      }
      setLoading(false);
    } else {
      // Handle non-tag paths as before
      if (segmentIndex === 0) {
        setLabel(t(segment));
      }
      if (segmentIndex === 1 && pathSegments[0] === "explore") {
        setLabel(t(segment));
      }
      if (segmentIndex === 1 && pathSegments[0] === "playground") {
        setLabel(t(segment));
      }
      if (segmentIndex === 2 && pathSegments[0] === "explore" && pathSegments[1] !== "tags") {
        setLabel(Truncate(segment, 13, "middle"));
      }
      setLoading(false);
    }
  }, [segment, segmentIndex, pathSegments, t, fetchTagDisplayName, tags]);

  return { label, loading: isLoading || loading };
};

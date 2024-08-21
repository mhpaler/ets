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

  // State for the transformed label and loading status
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  // Determine if we need to fetch the tag display name
  const fetchTagDisplayName = segmentIndex === 2 && pathSegments[0] === "explore" && pathSegments[1] === "tags";

  // Fetch tags using useCtags hook
  const { tags, isLoading } = useCtags({
    pageSize: 1,
    skip: 0,
    filter: { machineName: segment },
  });

  useEffect(() => {
    if (fetchTagDisplayName) {
      setLoading(true);
      if (tags && tags.length > 0) {
        setLabel(tags[0].display); // Set label to the fetched tag display name
      } else {
        setLabel(segment); // Fall back to the original segment if no tags are found
      }
      setLoading(false);
    } else {
      // Always translate the first segment
      if (segmentIndex === 0) {
        setLabel(t(segment));
      }

      // Translate the second segment if the first segment is "explore"
      if (segmentIndex === 1 && pathSegments[0] === "explore") {
        setLabel(t(segment));
      }

      // Playground
      if (segmentIndex === 1 && pathSegments[0] === "playground") {
        setLabel(t(segment));
      }
      // Truncate the third segment if the first segment is "explore" and the second segment is not "tags"
      if (segmentIndex === 2 && pathSegments[0] === "explore" && pathSegments[1] !== "tags") {
        setLabel(Truncate(segment, 13, "middle"));
      }

      setLoading(false);
    }
  }, [segment, segmentIndex, pathSegments, t, fetchTagDisplayName, tags]);

  return { label, loading: isLoading || loading };
};

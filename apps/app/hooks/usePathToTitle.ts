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
  const [label, setLabel] = useState("");

  const pathSegments = router.asPath.split("/").filter(Boolean);
  const segmentIndex = pathSegments.indexOf(segment);

  const isTagPath = segmentIndex === 2 && pathSegments[0] === "explore" && pathSegments[1] === "tags";
  const { tags, isLoading } = useCtags({
    pageSize: 1,
    skip: 0,
    filter: { machineName: segment },
  });

  useEffect(() => {
    if (isTagPath) {
      if (tags?.[0]?.display) {
        setLabel(tags[0].display);
      } else {
        setLabel(segment);
      }
    } else if (segmentIndex === 0) {
      setLabel(t(segment));
    } else if (segmentIndex === 1 && pathSegments[0] === "explore") {
      setLabel(t(segment));
    } else if (segmentIndex === 1 && pathSegments[0] === "playground") {
      setLabel(t(segment));
    } else if (segmentIndex === 2 && pathSegments[0] === "explore" && pathSegments[1] !== "tags") {
      setLabel(Truncate(segment, 14, "middle"));
    }
  }, [segment, segmentIndex, pathSegments, t, isTagPath, tags]);

  return { label, loading: isLoading };
};

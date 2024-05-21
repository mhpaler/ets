import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { Truncate } from "@app/components/Truncate";
import { useCtags } from "@app/hooks/useCtags";
import { useState, useEffect } from "react";

const getTitleSegments = (router: ReturnType<typeof useRouter>, t: (key: string) => string): string[] => {
  const pathSegments = router.pathname.split("/").slice(1);
  return pathSegments
    .map((segment) => {
      if (segment === "[...id]") return "";
      if (segment.startsWith("[") && segment.endsWith("]")) {
        const paramName = segment.slice(1, -1);
        const value = router.query[paramName];
        return value ? value.toString() : "";
      }
      return t(segment);
    })
    .filter(Boolean);
};

const useAdjustSegments = (segments: string[]): string[] => {
  const [adjustedSegments, setAdjustedSegments] = useState<string[]>(segments);

  useEffect(() => {
    const adjust = async () => {
      let newSegments = [...segments];
      if (newSegments.length > 1 && newSegments[0].endsWith("s")) {
        newSegments[0] = newSegments[0].slice(0, -1);
      }

      if (newSegments.length > 1 && newSegments[0] === "Tag") {
        const { tags } = await useCtags({
          pageSize: 1,
          skip: 0,
          filter: { machineName: newSegments[1] },
          config: {
            revalidateOnFocus: false,
            revalidateOnMount: true,
            revalidateOnReconnect: false,
            refreshWhenOffline: false,
            refreshWhenHidden: false,
            refreshInterval: 0,
          },
        });

        const displayName = tags && tags.length > 0 ? tags[0].display : newSegments[1];
        newSegments = newSegments.slice(1).map((segment, index) => {
          if (index === 0) {
            return `#${Truncate(displayName, 32, "middle")}`;
          }
          return `#${Truncate(segment, 32, "middle")}`;
        });
      } else {
        newSegments = newSegments.map((segment) => Truncate(segment, 32, "middle"));
      }

      setAdjustedSegments(newSegments);
    };

    adjust();
  }, [segments]);

  return adjustedSegments;
};

const usePathToTitle = (): string => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [title, setTitle] = useState<string>(t("dashboard"));

  const titleSegments = getTitleSegments(router, t);
  const adjustedSegments = useAdjustSegments(titleSegments);

  useEffect(() => {
    const newTitle = adjustedSegments.length > 1 ? adjustedSegments.join(": ") : adjustedSegments.join("");
    setTitle(newTitle || t("dashboard"));
  }, [adjustedSegments, t]);

  return title;
};

export default usePathToTitle;

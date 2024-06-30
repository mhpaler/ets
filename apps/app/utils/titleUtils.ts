import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { Truncate } from "@app/components/Truncate";

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

const adjustSegments = (segments: string[]): string[] => {
  if (segments.length > 1 && segments[0].endsWith("s")) {
    segments[0] = segments[0].slice(0, -1);
  }
  if (segments.length > 1 && segments[0] === "Tag") {
    // Remove the first segment and truncate the rest
    return segments.slice(1).map((segment, index) => `#${Truncate(segment, 32, "middle")}`);
  }
  return segments.map((segment) => Truncate(segment, 32, "middle")); // Ensure other segments are also truncated
};

export const pathToTitle = (): string => {
  const { t } = useTranslation("common");
  const router = useRouter();

  if (router.pathname === "/" || router.pathname.trim() === "") {
    return t("explorer");
  }

  let titleSegments = getTitleSegments(router, t);
  titleSegments = adjustSegments(titleSegments);

  const title = titleSegments.length > 1 ? titleSegments.join(": ") : titleSegments.join("");
  return title || t("explorer");
};

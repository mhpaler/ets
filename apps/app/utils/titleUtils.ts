import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { Truncate } from "@app/components/Truncate";

export const pathToTitle = () => {
  const { t } = useTranslation("common");
  const router = useRouter();

  // Check if pathname is root ("/") or empty
  if (router.pathname === "/" || router.pathname.trim() === "") {
    return t("dashboard");
  }

  const pathSegments = router.pathname.split("/").slice(1);

  // If there are no segments, return the default title
  if (pathSegments.length === 0) {
    return t("dashboard");
  }

  const title = pathSegments
    .map((segment, index, segments) => {
      // Check if the segment is a dynamic route parameter
      if (segment.startsWith("[") && segment.endsWith("]")) {
        // Extract the actual parameter name
        const paramName = segment.slice(1, -1);
        // Use the value from the router query, if available
        const value = router.query[paramName];

        if (index === 1 && segments[0] === "tags" && value) {
          // If the first segment is "tags" and there is a dynamic argument, append "#" to it
          return `#${Truncate(value)}`;
        } else {
          return Truncate(value);
        }
      }

      // For regular segments, use the translation function
      return t(segment);
    })
    .join(": ");

  // If the title is empty, return the default title
  return title || t("dashboard");
};

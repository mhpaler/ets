import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { Truncate } from "@app/components/Truncate";

export const pathToTitle = () => {
  const { t } = useTranslation("common");
  const router = useRouter();

  if (router.pathname === "/" || router.pathname.trim() === "") {
    return t("dashboard");
  }

  const pathSegments = router.pathname.split("/").slice(1);
  if (pathSegments.length === 0) {
    return t("dashboard");
  }

  const titleSegments = pathSegments
    .map((segment) => {
      // Skip the dynamic segment placeholder when building the title
      if (segment === "[...id]") {
        return "";
      }
      // Handle dynamic segments and router.query parameters
      if (segment.startsWith("[") && segment.endsWith("]")) {
        const paramName = segment.slice(1, -1);
        const value = router.query[paramName];
        if (value) {
          return `#${Truncate(value.toString())}`; // Ensure value is treated as a string
        }
        return ""; // No value for the parameter, return empty
      }
      // Translate static segments
      return t(segment);
    })
    .filter(Boolean); // Filter out empty strings to avoid incorrect joining

  // Join with ": " only if there's more than one segment to display
  const title = titleSegments.length > 1 ? titleSegments.join(": ") : titleSegments.join("");

  return title || t("dashboard");
};

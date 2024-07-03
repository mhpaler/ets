import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import Breadcrumbs from "nextjs-breadcrumbs2";
import { BreadcrumbItem } from "@app/components/BreadcrumbItem";
import PageTitle from "@app/components/PageTitle";
import { Truncate } from "@app/components/Truncate";

// Type definition for the translation function
type TranslateFunction = (key: string) => string;

/**
 * Extracts and translates the segments of a given path.
 *
 * @param {string} path - The URL path.
 * @param {Record<string, any>} query - The query parameters from the URL.
 * @param {TranslateFunction} t - The translation function.
 * @returns {string[]} - An array of translated path segments.
 */
const getTitleSegments = (path: string, query: Record<string, any>, t: TranslateFunction): string[] => {
  const pathSegments = path.split("/").slice(1);
  return pathSegments
    .map((segment) => {
      if (segment === "[...id]") return "";
      if (segment.startsWith("[") && segment.endsWith("]")) {
        const paramName = segment.slice(1, -1);
        const value = query[paramName];
        return value ? value.toString() : "";
      }
      return t(segment);
    })
    .filter(Boolean);
};

/**
 * Adjusts and truncates the path segments.
 *
 * @param {string[]} segments - The path segments.
 * @returns {string[]} - The adjusted and truncated segments.
 */
const adjustSegments = (segments: string[]): string[] => {
  if (segments.length > 1 && segments[0].endsWith("s")) {
    segments[0] = segments[0].slice(0, -1);
  }
  if (segments.length > 1 && segments[0] === "Tag") {
    // Remove the first segment and truncate the rest
    return segments.slice(1).map((segment) => `#${Truncate(segment, 32, "middle")}`);
  }
  return segments.map((segment) => Truncate(segment, 32, "middle")); // Ensure other segments are also truncated
};

export const pathToTitle = (path: string, query: Record<string, any>, t: TranslateFunction): string => {
  let titleSegments = getTitleSegments(path, query, t);
  titleSegments = adjustSegments(titleSegments);
  const title = titleSegments.length > 0 ? titleSegments[titleSegments.length - 1] : "";
  return title || t("home");
};

/**
 * PageInfo component that renders breadcrumbs and page title based on the current route.
 *
 * @returns {JSX.Element} - The PageInfo component.
 */
export default function PageInfo() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const isRootPath = router.pathname === "/" || router.pathname.trim() === "";
  const pathSegments = router.pathname.split("/").filter(Boolean);
  const title = !isRootPath ? pathToTitle(router.pathname, router.query, t) : "";

  // Only start showing breadcrumbs on sub page of a section eg. /explore/explore/tags
  const showBreadcrumbs = pathSegments.length > 1;

  return (
    <>
      {showBreadcrumbs && (
        <div className="col-span-12 hidden lg:block">
          <Breadcrumbs
            omitRootLabel
            transformLabel={(title) => {
              return <BreadcrumbItem title={Truncate(title)} />;
            }}
            containerClassName={"breadcrumbs"}
            inactiveItemClassName={"text-sm font-medium link-primary"}
            activeItemClassName={"text-sm font-medium opacity-50 pointer-events-none"}
            listClassName={"flex items-center space-x-2 breadcrumbs text-sm"}
            useDefaultStyle={false}
          />
        </div>
      )}
      <PageTitle title={title} />
    </>
  );
}

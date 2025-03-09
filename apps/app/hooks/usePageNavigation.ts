import { Truncate } from "@app/components/Truncate";
import type { PageNavigationState } from "@app/types/navigation";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useCtags } from "./useCtags";

/**
 * Hook that handles all navigation-related state and formatting
 * Provides consistent breadcrumb and title handling across the application
 *
 * Features:
 * - Generates linked breadcrumbs with proper formatting
 * - Handles singular/plural section names
 * - Special handling for CTAG display
 * - Truncates long identifiers in detail views
 *
 * @returns {PageNavigationState} Navigation state including title and breadcrumbs
 */
export const usePageNavigation = (): PageNavigationState => {
  const router = useRouter();
  const { t } = useTranslation("common");

  /**
   * Mapping of URL segments to their singular display forms
   * Used for formatting page titles in detail views
   */
  const SECTION_NAMES = {
    ctags: "CTAG",
    "tagging-records": "Tagging Record",
    targets: "Target",
    taggers: "Tagger",
    owners: "Owner",
    relayers: "Relayer",
    creators: "Creator",
  } as const;

  /**
   * Extracts and filters path segments from the current route
   */
  const pathSegments = useMemo(() => router.asPath.split("/").filter(Boolean), [router.asPath]);

  /**
   * Determines if current path is a CTAG detail view
   */
  const isTagPath = useMemo(() => pathSegments[0] === "explore" && pathSegments[1] === "ctags", [pathSegments]);

  /**
   * Extracts tag name from path if viewing a CTAG detail
   */
  const tagName = useMemo(() => (isTagPath ? pathSegments[2] : ""), [isTagPath, pathSegments]);

  /**
   * Fetches CTAG data if viewing a CTAG detail page
   */
  const { tags, isLoading: isTagLoading } = useCtags({
    pageSize: 1,
    skip: 0,
    filter: tagName ? { machineName: tagName } : undefined,
  });

  /**
   * Processes route segments and generates navigation state
   * Handles special cases for different route types
   */
  const navigationState = useMemo(() => {
    if (router.pathname === "/") {
      return { title: "", breadcrumbs: [], isLoading: false };
    }

    const segments = pathSegments.map((segment, index) => {
      if (index === 0) {
        return { value: segment, type: "root", display: t(segment) };
      }

      if (index === 1) {
        const display = segment === "ctags" ? "CTAGs" : t(segment);
        return { value: segment, type: "section", display };
      }

      if (index === 2) {
        if (pathSegments[1] === "ctags") {
          const tagDisplay = tags?.[0]?.display || segment;
          return { value: segment, type: "detail", display: tagDisplay };
        }
        return { value: segment, type: "detail", display: Truncate(segment, 14, "middle") };
      }

      return { value: segment, type: "detail", display: segment };
    });

    let title = "";
    if (segments.length === 3 && segments[0].value === "explore") {
      const sectionKey = segments[1].value as keyof typeof SECTION_NAMES;
      const sectionDisplay = SECTION_NAMES[sectionKey] || segments[1].display;
      title = `${sectionDisplay}: ${segments[2].display}`;
    } else {
      title = segments[segments.length - 1].display;
    }

    return {
      title,
      breadcrumbs: segments.map((segment) => segment.display),
      isLoading: isTagLoading,
    };
  }, [router.pathname, pathSegments, tags, isTagLoading, t, SECTION_NAMES]);

  return navigationState;
};

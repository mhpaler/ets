/**
 * Represents a segment in the route path with its display properties
 */
export type RouteSegment = {
  value: string;
  type: "root" | "section" | "detail";
  display: string;
};

/**
 * Defines how routes should be formatted for display
 */
export type RoutePattern = {
  pattern: string;
  formatTitle: (segments: RouteSegment[]) => string;
  formatBreadcrumbs: (segments: RouteSegment[]) => string[];
};

/**
 * Navigation state returned by usePageNavigation hook
 */
export type PageNavigationState = {
  title: string;
  breadcrumbs: string[];
  isLoading: boolean;
};

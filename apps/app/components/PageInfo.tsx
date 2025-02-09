import { usePageNavigation } from "@app/hooks/usePageNavigation";
import Link from "next/link";

/**
 * PageInfo component that renders the page navigation elements
 *
 * Displays:
 * - Breadcrumb trail with clickable links and dividers
 * - Page title with proper formatting based on section
 *
 * Uses usePageNavigation hook for all navigation state management
 */
export default function PageInfo() {
  const { title, breadcrumbs, isLoading } = usePageNavigation();

  if (isLoading) {
    return null;
  }

  const showBreadcrumbs = breadcrumbs.length > 1;

  return (
    <>
      {showBreadcrumbs && (
        <div className="col-span-12 hidden lg:block">
          <nav aria-label="breadcrumbs">
            <ol className="flex items-center breadcrumbs text-sm">
              {breadcrumbs.map((crumb, index) => {
                const path = `/${breadcrumbs
                  .slice(0, index + 1)
                  .join("/")
                  .toLowerCase()}`;

                return (
                  <li key={`${crumb}-${index}`}>
                    <span className="flex items-center">
                      {index > 0 && <span className="text-slate-400 mx-4">›</span>}
                      {index === breadcrumbs.length - 1 ? (
                        <span className="text-sm font-medium opacity-50 pointer-events-none">{crumb}</span>
                      ) : (
                        <Link href={path} className="text-sm font-medium link-primary">
                          {crumb}
                        </Link>
                      )}
                    </span>
                  </li>
                );
              })}{" "}
            </ol>
          </nav>
        </div>
      )}
      {title && (
        <div className="col-span-12">
          <h1 className="text-2xl font-medium">{title}</h1>
        </div>
      )}
    </>
  );
}

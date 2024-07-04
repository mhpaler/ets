import { useRouter } from "next/router";
import Breadcrumbs from "nextjs-breadcrumbs2";
import { BreadcrumbItem } from "@app/components/BreadcrumbItem";
import PageTitle from "@app/components/PageTitle";

/**
 * PageInfo component that renders breadcrumbs and page title based on the current route.
 *
 * @returns {JSX.Element} - The PageInfo component.
 */
export default function PageInfo() {
  const router = useRouter();
  const pathSegments = router.pathname.split("/").filter(Boolean);

  // Only start showing breadcrumbs on sub page of a section eg. /explore/explore/tags
  const showBreadcrumbs = pathSegments.length > 1;

  return (
    <>
      {showBreadcrumbs && (
        <div className="col-span-12 hidden lg:block">
          <Breadcrumbs
            omitRootLabel
            transformLabel={(label) => {
              return <BreadcrumbItem breadcrumb={label} />;
            }}
            containerClassName={"breadcrumbs"}
            inactiveItemClassName={"text-sm font-medium link-primary"}
            activeItemClassName={"text-sm font-medium opacity-50 pointer-events-none"}
            listClassName={"flex items-center space-x-2 breadcrumbs text-sm"}
            useDefaultStyle={false}
          />
        </div>
      )}
      <PageTitle />
    </>
  );
}

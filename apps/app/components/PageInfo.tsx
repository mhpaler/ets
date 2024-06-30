import useTranslation from "next-translate/useTranslation";
import Breadcrumbs from "nextjs-breadcrumbs2";
import { pathToTitle } from "@app/utils/titleUtils";
import { BreadcrumbItem } from "@app/components/BreadcrumbItem";
import PageTitle from "@app/components/PageTitle";
import { Truncate } from "@app/components/Truncate";

export default function PageInfo() {
  const { t } = useTranslation("common");
  const title = pathToTitle();

  return (
    <>
      <div className="col-span-12 hidden lg:block">
        <Breadcrumbs
          rootLabel={t("explorer")}
          transformLabel={(title) => {
            return <BreadcrumbItem title={Truncate(title)} />;
          }}
          inactiveItemClassName={"text-sm font-medium link-primary capitalize"}
          activeItemClassName={"text-sm font-medium opacity-50 pointer-events-none"}
          listClassName={"flex items-center space-x-2 truncate"}
          useDefaultStyle={false}
        />
      </div>
      <PageTitle title={title} />
    </>
  );
}

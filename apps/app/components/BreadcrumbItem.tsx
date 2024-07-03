import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

const BreadcrumbItem = (props: any) => {
  let label;
  const router = useRouter();
  const { t } = useTranslation("common");
  // Sets label only when we are not on home page.
  // effectively removes breadcrumb on homepage.

  if (router.asPath != "/") {
    // Replace dash with space.
    label = props.title.replace(/-/g, " ");

    // Handle tag breadcrumb
    let path = router.asPath.substring(1).split("/");
    if (path.length == 2 && path[0] == "tags") {
      if (label == path[1]) {
        label = "#" + label;
      }
    }

    if (label == "tags") {
      label = t("tags");
    }
  }

  return <>{!label ? null : <span className="flex">{label}</span>}</>;
};

export { BreadcrumbItem };

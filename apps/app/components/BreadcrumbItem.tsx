import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import useSWR from "swr";

const BreadcrumbItem = (props: any) => {
  let label;
  const router = useRouter();
  const { t } = useTranslation("common");

  const dividerIcon = (
    <svg
      className="flex-shrink-0 h-5 w-5 text-gray-300 mr-2"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M10.75 8.75L14.25 12L10.75 15.25"
      ></path>
    </svg>
  );

  // Sets label only when we are not on home page.
  // effectively removes breadcrumb on homepage.

  if (router.asPath != "/") {
    // Replace dash with space.
    label = props.title.replace(/-/g, " ");

    // Handle ctag breadcrumb
    let path = router.asPath.substring(1).split("/");
    if (path.length == 2 && path[0] == "ctags") {
      if (label == path[1]) {
        label = "#" + label;
      }
    }

    if (label == "ctags") {
      label = t("ctags");
    }
  }

  return (
    <>
      {!label ? null : (
        <span className="flex">
          {label == "Home" ? null : dividerIcon}
          {label}
        </span>
      )}
    </>
  );
};

export { BreadcrumbItem };

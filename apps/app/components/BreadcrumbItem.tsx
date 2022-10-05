import { useRouter } from "next/router";

const BreadcrumbItem = (props: any) => {
  const router = useRouter();

  console.log("Route", router.asPath);
  let label;
  if (router.asPath != "/") {
    label = props.title.replace(/-/g, " ");
  }

  return (
    <>
      {label ? (
        <span className="flex">
          {label != "Home" ? (
            <svg
              className="flex-shrink-0 h-5 w-5 text-gray-300 mr-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
            </svg>
          ) : null}
          {label}
        </span>
      ) : null}
    </>
  );
};

export { BreadcrumbItem };

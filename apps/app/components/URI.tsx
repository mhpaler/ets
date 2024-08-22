import useTranslation from "next-translate/useTranslation";

const URI = ({ value }: { value: string }) => {
  const { t } = useTranslation("common");
  const openURI = (uri: string) => {
    window.open(uri, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        openURI(value);
      }}
      className="link link-primary"
    >
      <svg className="inline-flex w-5 h-5" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <title>{t("Open URI")}</title>
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M17.25 15.25V6.75H8.75"
        />
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M17 7L6.75 17.25"
        />
      </svg>
      <span className="sr-only">{t("Open URI")}</span>
    </button>
  );
};

export { URI };

import useTranslation from "next-translate/useTranslation";

const URI = ({ value }: { value: string }) => {
  const { t } = useTranslation("common");
  const openURI = (uri: string) => {
    window.open(uri, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={() => openURI(value)}
      className="relative text-pink-600 transition-colors hover:text-pink-800 group"
    >
      <div className="absolute w-8 h-8 -mt-4 -ml-4 rounded-full top-1/2 left-1/2"></div>
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M17.25 15.25V6.75H8.75"
        />
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M17 7L6.75 17.25"
        />
      </svg>
      <span className="sr-only">{t("open URI")}</span>
    </button>
  );
};

export { URI };

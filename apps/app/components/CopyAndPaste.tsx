import useTranslation from "next-translate/useTranslation";
import useCopyToClipboard from "../hooks/useCopyToClipboard";

const CopyAndPaste = ({ value }: { value: string }) => {
  const [isCopied, copy] = useCopyToClipboard();
  const { t } = useTranslation("common");

  return (
    <button onClick={() => copy(value)} className="link link-primary">
      {isCopied ? (
        <svg className="inline-flex w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24">
          <path
            d="M7.75 12.75L10 15.25L16.25 8.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      ) : (
        <svg className="inline-flex w-5 h-5" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M6.5 15.25V15.25C5.5335 15.25 4.75 14.4665 4.75 13.5V6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H13.5C14.4665 4.75 15.25 5.5335 15.25 6.5V6.5"
          ></path>
          <rect
            width="10.5"
            height="10.5"
            x="8.75"
            y="8.75"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            rx="2"
          ></rect>
        </svg>
      )}
      <span className="sr-only">{t("copy")}</span>
    </button>
  );
};

export { CopyAndPaste };

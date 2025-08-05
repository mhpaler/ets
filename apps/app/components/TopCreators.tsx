import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { CopyAndPaste } from "../components/CopyAndPaste";
import { useCreators } from "../hooks/useCreators";
import { toDp, toEth } from "../utils";

const TopCreators = () => {
  const { t } = useTranslation("common");
  const { creators } = useCreators({ pageSize: 3 });

  return (
    <div className="w-full mx-auto">
      <div className="rounded-md shadow-lg shadow-slate-400/20 ring-1 ring-slate-200">
        <div className="border-b border-slate-200">
          <Link href="/creators" className="flex justify-between rounded-t-md" legacyBehavior passHref>
            <div>
              <h2 className="px-6 py-3 font-semibold text-left text-slate-700">{t("top-creators")}</h2>
            </div>
            <div className="flex items-center pr-2">
              {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
              <svg className="inline-flex w-6 h-6 text-pink-600 hover:text-pink-700" fill="none" viewBox="0 0 24 24">
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
            </div>
          </Link>
        </div>

        <div className="divide-y rounded-b-md divide-slate-200">
          {/* TODO: update :any to use type */}
          {creators?.map((creator: any) => (
            <div className="grid grid-flow-col grid-cols-2 px-6 py-4 space-x-4" key={creator.id}>
              <div>
                <div className="flex space-x-2">
                  <div className="flex-grow overflow-hidden text-right text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                    <Link href={`/creators/${creator.id}`} className="text-pink-600 hover:text-pink-700" legacyBehavior>
                      {creator.id}
                    </Link>
                  </div>
                  <CopyAndPaste value={creator.id} />
                </div>
                <div className="text-sm leading-6 text-slate-500">
                  {t("tag-count", { count: Number.parseInt(creator.mintCount) })}
                </div>
              </div>
              <div className="col-span-2">
                <div className="overflow-hidden text-slate-700 text-ellipsis whitespace-nowrap">
                  {toEth(creator.tagFees, 4)} {t("eth-earned")}
                </div>
                <div className="text-sm leading-6 text-slate-500">
                  {t("tagged-count", { count: Number.parseInt(creator.tagCount) })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { TopCreators };

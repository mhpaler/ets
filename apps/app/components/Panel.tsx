import Link from "next/link";
import { ReactNode } from "react";

const Panel = ({ href, title, children }: { href?: string; title?: string; children: ReactNode }) => {
  return (
    <div className="w-full mx-auto">
      <div className="rounded-md shadow-lg shadow-slate-400/20 ring-1 ring-slate-200">
        {title && (
          <div className="border-b border-slate-200">
            {href ? (
              <Link href={href} className="flex justify-between rounded-t-md" legacyBehavior passHref>
                <div>
                  <h2 className="px-6 py-3 font-semibold text-left text-slate-700">{title}</h2>
                </div>
                <div className="flex items-center pr-2">
                  <svg
                    className="inline-flex w-6 h-6 text-pink-600 hover:text-pink-700"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M17.25 15.25V6.75H8.75"
                    ></path>
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M17 7L6.75 17.25"
                    ></path>
                  </svg>
                </div>
              </Link>
            ) : (
              <h2 className="px-6 py-3 font-semibold text-left text-slate-700">{title}</h2>
            )}
          </div>
        )}

        <div className="divide-y rounded-b-md divide-slate-200">{children}</div>
      </div>
    </div>
  );
};

export { Panel };

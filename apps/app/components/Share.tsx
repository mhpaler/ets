// import useTranslation from 'next-translate/useTranslation';
import useCopyToClipboard from "../hooks/useCopyToClipboard";

const Share = ({ url }: { url: string }) => {
  const [isCopied, copy] = useCopyToClipboard();

  return (
    <div>
      <span className="relative z-0 flex rounded-lg shadow-lg shadow-slate-300/50">
        <button
          type="button"
          className="relative inline-flex items-center justify-center flex-grow px-4 py-3 font-bold text-pink-500 transition-colors bg-white border rounded-l-lg border-slate-300 hover:bg-slate-50 hover:text-pink-600 focus:z-10 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
        >
          Share
        </button>
        <button
          type="button"
          onClick={() => copy(url)}
          className="relative inline-flex items-center px-4 py-3 -ml-px font-bold text-pink-500 transition-colors bg-white border rounded-r-lg border-slate-300 hover:text-pink-600 hover:bg-slate-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
        >
          {isCopied ?
            <svg className="relative inline-flex w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24">
              <path d="M7.75 12.75L10 15.25L16.25 8.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            :
            <svg className="relative inline-flex w-6 h-6" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.75 13.25L18 12C19.6569 10.3431 19.6569 7.65685 18 6V6C16.3431 4.34315 13.6569 4.34315 12 6L10.75 7.25"></path>
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.25 10.75L6 12C4.34315 13.6569 4.34315 16.3431 6 18V18C7.65685 19.6569 10.3431 19.6569 12 18L13.25 16.75"></path>
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.25 9.75L9.75 14.25"></path>
            </svg>
          }
          <span className="sr-only">Permalink</span>
        </button>
      </span>
    </div>
  );
}

export { Share };

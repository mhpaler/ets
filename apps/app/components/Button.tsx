import { ReactNode, MouseEventHandler } from "react";
import Link from "next/link";

interface Button {
  href?: string;
  disabled?: boolean;
  children: ReactNode;
  onClick?: MouseEventHandler;
}

const Button = ({ href, disabled, children, onClick }: Button) => {
  if (href)
    return (
      <Link href={href}>
        <a className="relative text-sm font-semibold z-0 inline-flex items-center justify-center px-3 py-2 text-pink-500 transition-colors bg-white border rounded-lg shadow-lg border-slate-300 hover:bg-slate-50 hover:text-pink-600 focus:z-10 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 shadow-slate-300/50">
          {children}
        </a>
      </Link>
    );

  return (
    <button
      onClick={onClick}
      type="button"
      disabled={disabled}
      className="relative text-sm font-semibold z-0 inline-flex items-center justify-center px-3 py-2 text-pink-500 transition-colors bg-white border rounded-lg shadow-lg shadow-slate-300/50 border-slate-300 disabled:shadow-none disabled:text-slate-500 disabled:cursor-not-allowed disabled:hover:text-slate-500 disabled:hover:bg-white disabled:opacity-50 hover:bg-slate-50 hover:text-pink-600 focus:z-10 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
    >
      {children}
    </button>
  );
};

export { Button };

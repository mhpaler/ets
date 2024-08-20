import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

interface Button {
  href?: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: MouseEventHandler;
  type?: "button" | "reset" | "submit" | undefined;
}

const Button = ({ href, disabled = false, className, children, onClick, type }: Button) => {
  if (href)
    return (
      <Link href={href} className={`btn ${className}`}>
        {children}
      </Link>
    );

  return (
    <button onClick={onClick} type={type} disabled={disabled} className={`btn ${className}`}>
      {children}
    </button>
  );
};

export { Button };

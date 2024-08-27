import React from "react";

export function URIIcon({ className = "inline-flex w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" fill="none" viewBox="0 0 24 24">
      <title>URI Icon</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M17.25 15.25V6.75H8.75"
      />
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 7L6.75 17.25" />
    </svg>
  );
}

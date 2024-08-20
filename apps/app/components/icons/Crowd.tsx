import React from "react";

export function Crowd({ size = 24 }) {
  const viewBoxDimensions = "0 0 24 24";

  return (
    <svg width={size} height={size} viewBox={viewBoxDimensions} fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Crowd</title>
      <circle
        cx="7"
        cy="14"
        r="1.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="14"
        r="1.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="9"
        cy="10"
        r="1.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="15"
        cy="10"
        r="1.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="6"
        r="1.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="17"
        cy="14"
        r="1.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 19.25C9.5 19.25 9.25001 16.75 7 16.75C4.74999 16.75 4.75 19.25 4.75 19.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 19.25C14.5 19.25 14.25 16.75 12 16.75C9.74999 16.75 9.5 19.25 9.5 19.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.25 19.25C19.25 19.25 19.25 16.75 17 16.75C14.75 16.75 14.5 19.25 14.5 19.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

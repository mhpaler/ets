import React from "react";

export function Relayer({ size = 24 }) {
  const viewBoxDimensions = "0 0 24 24";

  return (
    <svg width={size} height={size} viewBox={viewBoxDimensions} fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Relayer</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M12.75 9.25 16 5.75m0 0 3.25 3.5M16 5.75v12.5m-4.75-3.5L8 18.25m0 0-3.25-3.5M8 18.25V5.75"
      />
    </svg>
  );
}

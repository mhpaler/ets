import React from "react";

export function Target({ size = 24 }) {
  // Calculate aspect ratio based on the desired size
  const aspectRatio = 24 / size;

  // Calculate viewBox dimensions dynamically
  const viewBoxDimensions = `0 0 24 ${24 / aspectRatio}`;

  return (
    <svg width={size} height={size} viewBox={viewBoxDimensions} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="12"
        cy="12"
        r="7.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></circle>
      <circle
        cx="12"
        cy="12"
        r="4.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></circle>
      <circle
        cx="12"
        cy="12"
        r="1.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></circle>
    </svg>
  );
}

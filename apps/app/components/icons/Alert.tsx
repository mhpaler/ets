import React from "react";

export function Alert({ size = 24 }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <title>Alert</title>
      <path
        d="M12 14.25C11.5858 14.25 11.25 14.5858 11.25 15C11.25 15.4142 11.5858 15.75 12 15.75V14.25ZM12.01 15.75C12.4242 15.75 12.76 15.4142 12.76 15C12.76 14.5858 12.4242 14.25 12.01 14.25V15.75ZM12 15.75H12.01V14.25H12V15.75Z"
        fill="currentColor"
      />
      <path
        d="M10.4033 5.41136L10.9337 5.94169L10.4033 5.41136ZM5.41136 10.4033L4.88103 9.87301L4.88103 9.87301L5.41136 10.4033ZM5.41136 13.5967L5.94169 13.0663L5.94169 13.0663L5.41136 13.5967ZM10.4033 18.5886L10.9337 18.0583L10.4033 18.5886ZM13.5967 18.5886L14.127 19.119L14.127 19.119L13.5967 18.5886ZM18.5886 10.4033L19.119 9.87301L19.119 9.87301L18.5886 10.4033ZM13.5967 5.41136L14.127 4.88103L14.127 4.88103L13.5967 5.41136ZM9.87301 4.88103L4.88103 9.87301L5.94169 10.9337L10.9337 5.94169L9.87301 4.88103ZM4.88103 14.127L9.87301 19.119L10.9337 18.0583L5.94169 13.0663L4.88103 14.127ZM14.127 19.119L19.119 14.127L18.0583 13.0663L13.0663 18.0583L14.127 19.119ZM19.119 9.87301L14.127 4.88103L13.0663 5.94169L18.0583 10.9337L19.119 9.87301ZM19.119 14.127C20.2937 12.9523 20.2937 11.0477 19.119 9.87301L18.0583 10.9337C18.6472 11.5226 18.6472 12.4774 18.0583 13.0663L19.119 14.127ZM9.87301 19.119C11.0477 20.2937 12.9523 20.2937 14.127 19.119L13.0663 18.0583C12.4774 18.6472 11.5226 18.6472 10.9337 18.0583L9.87301 19.119ZM4.88103 9.87301C3.70632 11.0477 3.70632 12.9523 4.88103 14.127L5.94169 13.0663C5.35277 12.4774 5.35277 11.5226 5.94169 10.9337L4.88103 9.87301ZM10.9337 5.94169C11.5226 5.35277 12.4774 5.35277 13.0663 5.94169L14.127 4.88103C12.9523 3.70632 11.0477 3.70632 9.87301 4.88103L10.9337 5.94169Z"
        fill="currentColor"
      />
      <path d="M12 8.75V12.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

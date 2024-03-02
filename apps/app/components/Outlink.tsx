import React, { ComponentProps } from "react";
import Link from "next/link";
import type { UrlObject } from "url";
import tw from "tailwind-styled-components";
import { OutlinkIcon } from "@app/components/icons";

export const StyledAnchor = tw.a`
  flex
  flex-row
  text-center
  link-primary
  font-semibold
  justify-center
`;

export const Outlink = ({
  href,
  children,
  ...props
}: Omit<ComponentProps<"a">, "href" | "target" | "rel"> &
  ComponentProps<typeof StyledAnchor> & {
    href: string | UrlObject;
  }) => {
  return (
    <StyledAnchor href={href} {...props} rel="noreferrer noopener" target="_blank" role="link">
      {children}
      <OutlinkIcon size={18} />
    </StyledAnchor>
  );
};

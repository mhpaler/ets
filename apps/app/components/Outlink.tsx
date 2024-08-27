import type { UrlObject } from "node:url";
import { OutlinkIcon } from "@app/components/icons";
import React, { type ComponentProps } from "react";
import tw from "tailwind-styled-components";

export const StyledAnchor = tw.a`
  flex
  flex-row
  text-center
  link-primary
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

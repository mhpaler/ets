import React from "react";
import Link from "next/link";
import { ComponentProps } from "react";
import type { UrlObject } from "url";
import tw from "tailwind-styled-components";

import OutlinkSVG from "@app/assets/Outlink.svg";
const OutlinkIcon = tw.div`ml-1`;

export const StyledAnchor = tw.a`
  m-4
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
  const InnerContent = (
    <StyledAnchor {...props} rel="noreferrer noopener" target="_blank" role="link">
      {children}
      <OutlinkIcon $as={OutlinkSVG} />
    </StyledAnchor>
  );

  if (typeof href === "string" && href.startsWith("http")) {
    return (
      <Link href={href} passHref>
        {InnerContent}
      </Link>
    );
  }
};

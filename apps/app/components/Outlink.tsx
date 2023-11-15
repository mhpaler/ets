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
  font-semibold
  justify-center
  text-pink-600
  hover:text-pink-700
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
    <StyledAnchor
      {...props}
      rel="noreferrer noopener"
      target="_blank"
      role="link"
    >
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

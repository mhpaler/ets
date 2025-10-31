import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ETS — Ethereum Tag Service",
  description: "Hashtags became memecoins. A decentralized tagging protocol powered by ERC-20 tokens.",
  openGraph: {
    title: "ETS — Ethereum Tag Service",
    description: "Hashtags became memecoins.",
    url: "https://ets.xyz",
    siteName: "ETS",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ETS — Ethereum Tag Service",
    description: "Hashtags became memecoins.",
    creator: "@etsxyz",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

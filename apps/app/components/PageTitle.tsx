import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Share } from "./Share";

interface PageTitle {
  title: string;
  shareUrl?: string;
}

export default function PageTitle({ title, shareUrl }: PageTitle) {
  return (
    <header className="mb-8 space-y-4 md:flex">
      <div className="flex items-center md:flex-grow">
        <h1 className="text-3xl font-bold text-slate-700">{title}</h1>
      </div>
      {/* 
      {shareUrl && <Share url={shareUrl} />}
      */}
    </header>
  );
}

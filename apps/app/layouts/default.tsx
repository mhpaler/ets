import React, { ReactNode } from "react";
import Navigation from "@app/components/Navigation";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  viewport: {
    width: "device-width",
    height: "device-height",
    initialScale: 1,
    maximumScale: 1,
    minimumScale: 1,
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="drawer lg:drawer-open">
        <input id="main-drawer" type="checkbox" className="drawer-toggle" />
        <main className="drawer-content overflow-auto">
          <div className="grid grid-cols-12 grid-rows-[min-content] gap-y-12 lg:gap-x-12 p-4 lg:p-10 overflow-auto">
            <Header />
            {children}
          </div>
        </main>
        <div className="drawer-side">
          <label htmlFor="main-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <Navigation />
        </div>
      </div>
      <Footer />
    </>
  );
}

import type { ReactNode } from "react";
import { SiteFooter } from "../../components/layout/site-footer";
import { SiteHeader } from "../../components/layout/site-header";

export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <a className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:bg-white focus:p-3" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}

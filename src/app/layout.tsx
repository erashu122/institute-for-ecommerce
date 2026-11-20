import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Institute for Ecommerce | Ecommerce Education",
  description: "Learn about the Institute for Ecommerce and its focus on online retail, digital marketing, and ecommerce operations.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col bg-canvas text-ink antialiased">
        {children}
      </body>
    </html>
  );
}

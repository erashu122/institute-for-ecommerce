import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/15">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm sm:px-10">
        <p className="font-semibold">Institute for Ecommerce</p>
        <Link className="underline underline-offset-4" href="/">Home</Link>
      </div>
    </footer>
  );
}

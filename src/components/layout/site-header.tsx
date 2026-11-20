import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-ink/15">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-6 py-5 sm:px-10">
        <Link className="font-serif text-xl font-bold" href="/">Institute for Ecommerce</Link>
        <nav aria-label="Main navigation">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            <li><Link className="hover:underline" href="/">Home</Link></li>
            <li><Link className="hover:underline" href="/about">About</Link></li><li><Link className="hover:underline" href="/courses">Courses</Link></li>
                      <li><Link className="hover:underline" href="/faculty">Faculty</Link></li>
            <li><Link className="hover:underline" href="/blog">Blog</Link></li>
            <li><Link className="hover:underline" href="/events">Events</Link></li>
            <li><Link className="hover:underline" href="/faqs">FAQs</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}




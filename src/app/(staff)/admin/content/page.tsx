import Link from "next/link";
import { requirePageStaff } from "../../../../server/auth/page";
import { contentKinds, kindLabels } from "../../../../features/content/schema";
export default async function CmsDashboard() {
  await requirePageStaff();
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-serif text-4xl">Institutional content</h1>
      <nav
        aria-label="Content management"
        className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {contentKinds.map((kind) => (
          <Link
            key={kind}
            className="rounded-xl border bg-white p-6 text-xl font-semibold hover:underline"
            href={"/admin/content/" + kind}
          >
            {kindLabels[kind]}
          </Link>
        ))}
      </nav>
    </section>
  );
}

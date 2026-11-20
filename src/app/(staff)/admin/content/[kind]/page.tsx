import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageStaff } from "../../../../../server/auth/page";
import {
  kindSchema,
  kindLabels,
  contentQuery,
} from "../../../../../features/content/schema";
import { listContent } from "../../../../../features/content/service";
export default async function ContentList({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  await requirePageStaff();
  const kind = kindSchema.safeParse((await params).kind);
  if (!kind.success) notFound();
  const query = await searchParams;
  const parsed = contentQuery.safeParse(query);
  const filters = parsed.success ? parsed.data : contentQuery.parse({});
  const result = await listContent(kind.data, filters, true);
  const root = "/admin/content/" + kind.data;
  const pageLink = (page: number) =>
    root + "?" + new URLSearchParams({ ...filters, page: String(page) });
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Link href="/admin/content" className="underline">
        All content
      </Link>
      <div className="my-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">{kindLabels[kind.data]}</h1>
        <Link
          className="rounded-full bg-forest px-6 py-3 text-white"
          href={root + "/new"}
        >
          Add content
        </Link>
      </div>
      {query.deleted === "1" && <p role="status">Content deleted.</p>}
      <form className="my-6 flex flex-wrap items-end gap-4">
        <label className="grid gap-2">
          Search content
          <input
            name="search"
            maxLength={100}
            defaultValue={filters.search}
            className="rounded-lg border bg-white p-3"
          />
        </label>
        <button className="rounded-full border px-6 py-3">Search</button>
      </form>
      <ul className="divide-y border-y">
        {result.items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-4 py-5"
          >
            <div>
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p>
                {item.status === "DRAFT"
                  ? "Draft"
                  : kind.data === "testimonials"
                    ? "Approved"
                    : "Published"}{" "}
                · Order {item.sortOrder}
              </p>
            </div>
            <Link className="underline" href={root + "/" + item.id + "/edit"}>
              Edit<span className="sr-only"> {item.title}</span>
            </Link>
          </li>
        ))}
      </ul>
      {!result.items.length && <p className="my-6">No content found.</p>}
      <nav aria-label="Admin content pagination" className="mt-6 flex gap-5">
        {filters.page > 1 && (
          <Link className="underline" href={pageLink(filters.page - 1)}>
            Previous
          </Link>
        )}
        <span>Page {filters.page}</span>
        {filters.page < result.totalPages && (
          <Link className="underline" href={pageLink(filters.page + 1)}>
            Next
          </Link>
        )}
      </nav>
    </section>
  );
}

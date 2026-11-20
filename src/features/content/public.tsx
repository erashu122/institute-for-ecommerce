import { FaqItem } from "./faq-item";
import { RichText } from "./rich-text";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { listContent, getContent, blogCategoryOptions } from "./service";
import {
  contentQuery,
  kindLabels,
  routes,
  type ContentEntry,
  type ContentKind,
} from "./schema";

export function eventTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}
export function ContentArticle({
  kind,
  entry,
}: {
  kind: ContentKind;
  entry: ContentEntry;
}) {
  return (
    <article className="mx-auto max-w-4xl px-6 py-12 sm:px-10">
      <h1 className="font-serif text-4xl sm:text-5xl">{entry.title}</h1>
      {entry.summary && (
        <p className="mt-5 text-xl leading-relaxed">{entry.summary}</p>
      )}
      {kind === "faculty" && (
        <p className="mt-4">
          {entry.details.position}
          {entry.details.qualifications && " · " + entry.details.qualifications}
        </p>
      )}
      {kind === "blog" && <p className="mt-4">By {entry.details.author}</p>}
      {kind === "events" && (
        <div className="my-5 space-y-2">
          <p>
            <time dateTime={entry.details.startsAt}>
              {eventTime(entry.details.startsAt)} IST
            </time>
            {entry.details.endsAt && (
              <>
                {" "}
                —{" "}
                <time dateTime={entry.details.endsAt}>
                  {eventTime(entry.details.endsAt)} IST
                </time>
              </>
            )}
          </p>
          <p>{entry.details.location}</p>
        </div>
      )}
      {entry.image && (
        <Image
          src={`/api/media/${entry.image.id}`}
          alt={entry.image.alt}
          width={1200}
          height={700}
          unoptimized
          className="my-8 max-h-[32rem] w-full rounded-2xl object-cover"
        />
      )}
      <div className="mt-6">
        <RichText text={entry.body} />
      </div>
      {kind === "pages" && (
        <div className="mt-10 space-y-8">
          {["mission", "vision", "leadership"].map((key) => (
            <section key={key}>
              <h2 className="font-serif text-3xl">
                {key[0].toUpperCase() + key.slice(1)}
              </h2>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed">
                {entry.details[key]}
              </p>
            </section>
          ))}
        </div>
      )}
    </article>
  );
}
export async function TestimonialsSection() {
  const result = await listContent("testimonials");
  if (!result.items.length) return null;
  return (
    <section
      aria-labelledby="testimonials-title"
      className="mx-auto max-w-6xl px-6 pb-12 sm:px-10"
    >
      <h2 id="testimonials-title" className="mb-6 font-serif text-3xl">
        Testimonials
      </h2>
      <div className="grid gap-5 md:grid-cols-2">
        {result.items.slice(0, 4).map((item) => (
          <figure key={item.id} className="rounded-2xl border p-6">
            <blockquote className="whitespace-pre-wrap leading-relaxed">
              {item.body}
            </blockquote>
            <figcaption className="mt-4 font-semibold">
              {item.title}
              {item.details.personRole && " · " + item.details.personRole}
            </figcaption>
          </figure>
        ))}
      </div>
      <Link className="mt-6 inline-block underline" href="/testimonials">
        Read all testimonials
      </Link>
    </section>
  );
}
export async function AboutPage() {
  const entry = await getContent("pages", "about");
  if (!entry)
    return (
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="font-serif text-4xl">About the institute</h1>
        <p className="mt-5">
          The institute profile will be available here once published.
        </p>
      </section>
    );
  return (
    <>
      <ContentArticle kind="pages" entry={entry} />
      <TestimonialsSection />
    </>
  );
}
export async function CollectionPage({
  kind,
  searchParams,
}: {
  kind: ContentKind;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parsed = contentQuery.safeParse(await searchParams);
  if (!parsed.success)
    return (
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="font-serif text-3xl">Check your filters</h1>
        <Link href={routes[kind]} className="mt-5 inline-block underline">
          Reset filters
        </Link>
      </section>
    );
  const query = parsed.data;
  const [result, categories] = await Promise.all([
    listContent(kind, query),
    kind === "blog" ? blogCategoryOptions() : Promise.resolve([]),
  ]);
  const pageLink = (page: number) =>
    routes[kind] +
    "?" +
    new URLSearchParams({ ...query, page: String(page) }).toString();
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10">
      <h1 className="font-serif text-4xl sm:text-5xl">{kindLabels[kind]}</h1>
      <form
        className="my-8 flex flex-wrap items-end gap-4"
        action={routes[kind]}
      >
        <label className="grid gap-2">
          Search
          <input
            name="search"
            maxLength={100}
            defaultValue={query.search}
            className="rounded-lg border bg-white p-3"
          />
        </label>
        {kind === "blog" && (
          <div className="grid gap-2">
            <label htmlFor="blog-category">Category</label>
            <select
              id="blog-category"
              name="category"
              defaultValue={query.category}
              className="rounded-lg border bg-white p-3"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>
        )}
        <button className="rounded-full bg-forest px-6 py-3 text-white">
          Search
        </button>
        <Link className="underline" href={routes[kind]}>
          Reset
        </Link>
      </form>
      {!result.items.length && (
        <p role="status">
          No published content found. Please check back later or adjust your
          search.
        </p>
      )}
      <div
        className={
          kind === "faqs"
            ? "max-w-3xl space-y-4"
            : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        }
      >
        {result.items.map((entry) =>
          kind === "faqs" ? (
            <FaqItem
              key={entry.id}
              id={entry.id}
              title={entry.title}
              body={entry.body}
            />
          ) : kind === "testimonials" ? (
            <figure key={entry.id} className="rounded-xl border p-6">
              <blockquote className="whitespace-pre-wrap leading-relaxed">
                {entry.body}
              </blockquote>
              <figcaption className="mt-5 font-semibold">
                {entry.title}
                {entry.details.personRole && " · " + entry.details.personRole}
              </figcaption>
            </figure>
          ) : (
            <article
              key={entry.id}
              className="rounded-2xl border border-ink/15 bg-white p-6"
            >
              {entry.image && (
                <Image
                  src={`/api/media/${entry.image.id}`}
                  alt={entry.image.alt}
                  width={600}
                  height={350}
                  unoptimized
                  className="mb-5 h-48 w-full rounded-xl object-cover"
                />
              )}
              <h2 className="font-serif text-2xl">
                <Link
                  className="hover:underline"
                  href={routes[kind] + "/" + entry.slug}
                >
                  {entry.title}
                </Link>
              </h2>
              {kind === "faculty" && (
                <p className="mt-3">{entry.details.position}</p>
              )}
              {kind === "events" && (
                <p className="mt-3">
                  <time dateTime={entry.details.startsAt}>
                    {eventTime(entry.details.startsAt)} IST
                  </time>
                </p>
              )}
              <p className="mt-3 leading-relaxed">{entry.summary}</p>
              <Link
                className="mt-5 inline-block font-semibold underline"
                href={routes[kind] + "/" + entry.slug}
              >
                Read more<span className="sr-only"> about {entry.title}</span>
              </Link>
            </article>
          ),
        )}
      </div>
      <nav aria-label="Content pagination" className="mt-8 flex gap-6">
        {query.page > 1 && (
          <Link className="underline" href={pageLink(query.page - 1)}>
            Previous
          </Link>
        )}
        <span>Page {query.page}</span>
        {query.page < result.totalPages && (
          <Link className="underline" href={pageLink(query.page + 1)}>
            Next
          </Link>
        )}
      </nav>
    </div>
  );
}
export async function DetailPage({
  kind,
  params,
}: {
  kind: ContentKind;
  params: Promise<{ slug: string }>;
}) {
  const entry = await getContent(kind, (await params).slug);
  if (!entry) notFound();
  return <ContentArticle kind={kind} entry={entry} />;
}
export async function detailMetadata(
  kind: ContentKind,
  slug: string,
): Promise<Metadata> {
  const entry = await getContent(kind, slug);
  return entry
    ? {
        title: entry.title + " | Institute for Ecommerce",
        description: entry.summary || entry.body.slice(0, 160),
        alternates: {
          canonical: routes[kind] + (kind === "pages" ? "" : "/" + entry.slug),
        },
      }
    : { title: "Content not found", robots: { index: false } };
}

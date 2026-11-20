import Link from "next/link";
import type { Metadata } from "next";
import { listCourses, categories } from "../../../features/courses/service";
import { courseQuery, modes } from "../../../features/courses/schema";
import { CourseCard, modeLabels } from "../../../features/courses/course-card";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Courses | Institute for Ecommerce", description: "Explore ecommerce courses by category, delivery mode, and topic." };

export default async function CoursesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const parsed = courseQuery.safeParse(await searchParams);
  if (!parsed.success) return <div className="mx-auto max-w-6xl px-6 py-16"><h1 className="font-serif text-4xl">Check your search filters</h1><p className="my-4">Use a valid page number and delivery mode.</p><Link href="/courses" className="underline">Reset filters</Link></div>;
  const query = parsed.data;
  const [result, options] = await Promise.all([listCourses(query), categories()]);
  function pageLink(page: number) {
    return "/courses?" + new URLSearchParams({ ...query, page: String(page) }).toString();
  }
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10">
      <h1 className="font-serif text-4xl sm:text-5xl">Find your next course</h1>
      <p className="mt-4 max-w-xl leading-relaxed">Explore ecommerce skills and find a course that fits the way you want to learn.</p>
      <form className="my-10 grid items-end gap-4 rounded-2xl border border-ink/15 p-5 sm:grid-cols-2 lg:grid-cols-4" action="/courses">
        <label className="grid gap-2 text-sm font-semibold">Search courses<input name="search" maxLength={100} defaultValue={query.search} className="rounded-lg border bg-white p-3 font-normal" placeholder="Course title or topic" /></label>
        <label className="grid gap-2 text-sm font-semibold">Category<select name="category" defaultValue={query.category} className="rounded-lg border bg-white p-3 font-normal"><option value="">All categories</option>{options.map(option => <option key={option.id} value={option.slug}>{option.name}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-semibold">Delivery mode<select name="mode" defaultValue={query.mode} className="rounded-lg border bg-white p-3 font-normal"><option value="">All delivery modes</option>{modes.map(mode => <option key={mode} value={mode}>{modeLabels[mode]}</option>)}</select></label>
        <div className="flex items-center gap-4"><button className="rounded-full bg-forest px-5 py-3 font-semibold text-white">Find courses</button><Link className="underline" href="/courses">Reset</Link></div>
      </form>
      <p className="mb-5" role="status">{result.total} course{result.total === 1 ? "" : "s"} found</p>
      {result.items.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{result.items.map(course => <CourseCard key={course.id} course={course} />)}</div> : <section className="rounded-2xl border border-ink/15 p-10"><h2 className="font-serif text-2xl">No courses found</h2><p className="mt-3">Try another topic or reset your filters.</p></section>}
      <nav aria-label="Course pagination" className="mt-8 flex items-center gap-6">
        {query.page > 1 && <Link className="underline" href={pageLink(query.page - 1)}>Previous</Link>}
        <span>Page {query.page}{result.totalPages > 0 ? ` of ${result.totalPages}` : ""}</span>
        {query.page < result.totalPages && <Link className="underline" href={pageLink(query.page + 1)}>Next</Link>}
      </nav>
    </div>
  );
}

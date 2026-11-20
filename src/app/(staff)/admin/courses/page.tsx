import Link from "next/link";
import { listCourses } from "../../../../features/courses/service";
import { courseQuery } from "../../../../features/courses/schema";

export default async function AdminCourses({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const parsed = courseQuery.safeParse(params);
  const query = parsed.success ? parsed.data : courseQuery.parse({});
  const result = await listCourses(query, true);
  return <section className="mx-auto max-w-6xl px-6 py-12">
    <div className="flex flex-wrap items-center justify-between gap-5"><h1 className="font-serif text-4xl">Courses</h1><Link className="rounded-full bg-forest px-6 py-3 text-white" href="/admin/courses/new">Add course</Link></div>
    {params.deleted === "1" && <p className="my-5" role="status">Course deleted.</p>}
    <form className="my-6 flex flex-wrap gap-4"><label className="grid gap-2">Search courses<input name="search" defaultValue={query.search} maxLength={100} className="rounded-lg border bg-white p-3" /></label><button className="self-end rounded-full border px-5 py-3">Search</button></form>
    <ul className="divide-y border-y">{result.items.map(course => <li key={course.id} className="flex flex-wrap items-center justify-between gap-4 py-5"><div><h2 className="text-xl font-semibold">{course.title}</h2><p>{course.status === "DRAFT" ? "Draft" : "Published"} · {course.category.name}</p></div><Link className="underline" href={`/admin/courses/${course.id}/edit`}>Edit<span className="sr-only"> {course.title}</span></Link></li>)}</ul>
    {!result.items.length && <p className="my-6">No courses found.</p>}
    <nav aria-label="Admin course pagination" className="my-6 flex gap-5">
      {query.page > 1 && <Link className="underline" href={`?search=${encodeURIComponent(query.search)}&page=${query.page - 1}`}>Previous</Link>}
      <span>Page {query.page}</span>
      {query.page < result.totalPages && <Link className="underline" href={`?search=${encodeURIComponent(query.search)}&page=${query.page + 1}`}>Next</Link>}
    </nav>
  </section>;
}

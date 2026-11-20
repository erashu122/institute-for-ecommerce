import Link from "next/link";
import type { CourseCard as CourseCardData } from "./schema";

export const modeLabels = { ONLINE: "Online", CLASSROOM: "Classroom", HYBRID: "Hybrid" };
export const feeLabel = (fee: string) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(fee));

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-ink/15 bg-white p-6">
      <p className="text-sm text-forest">{course.category.name}</p>
      <h2 className="mt-3 font-serif text-2xl"><Link className="hover:underline" href={`/courses/${course.slug}`}>{course.title}</Link></h2>
      <p className="mt-3 flex-1 leading-relaxed">{course.summary}</p>
      <dl className="my-6 grid grid-cols-2 gap-3 text-sm">
        <div><dt className="text-ink/70">Duration</dt><dd>{course.duration}</dd></div>
        <div><dt className="text-ink/70">Delivery</dt><dd>{modeLabels[course.mode]}</dd></div>
        <div><dt className="text-ink/70">Fee · INR</dt><dd>{feeLabel(course.fee)}</dd></div>
      </dl>
      <Link className="font-semibold underline underline-offset-4" href={`/courses/${course.slug}`}>View course<span className="sr-only"> — {course.title}</span></Link>
    </article>
  );
}

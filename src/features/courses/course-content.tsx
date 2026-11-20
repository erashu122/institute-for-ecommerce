import Image from "next/image";
import Link from "next/link";
import { modeLabels, feeLabel } from "./course-card";
import type { CourseDetail } from "./schema";

export function CourseContent({ course, preview = false }: { course: CourseDetail; preview?: boolean }) {
  return (
    <article className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
      <p>{course.category.name}</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl">{course.title}</h1>
      <p className="mt-5 max-w-3xl text-xl leading-relaxed">{course.summary}</p>
      <dl className="my-8 grid gap-5 rounded-2xl bg-forest p-6 text-white sm:grid-cols-3">
        <div><dt>Duration</dt><dd className="mt-2 font-semibold">{course.duration}</dd></div>
        <div><dt>Delivery</dt><dd className="mt-2 font-semibold">{modeLabels[course.mode]}</dd></div>
        <div><dt>Fee · INR</dt><dd className="mt-2 font-semibold">{feeLabel(course.fee)}</dd></div>
      </dl>
      {course.image && <Image src={course.image} alt="" width={1200} height={600} unoptimized className="mb-8 max-h-96 w-full rounded-2xl object-cover" />}
      <section><h2 className="font-serif text-2xl">About this course</h2><p className="mt-3 whitespace-pre-wrap leading-relaxed">{course.description}</p></section>
      <section className="mt-8"><h2 className="font-serif text-2xl">Eligibility</h2><p className="mt-3 whitespace-pre-wrap">{course.eligibility}</p></section>
      <div className="my-8 grid gap-8 md:grid-cols-2">
        <section><h2 className="font-serif text-2xl">Curriculum</h2><ul className="mt-3 list-disc space-y-2 pl-6">{course.curriculum.map((item, index) => <li key={index}>{item}</li>)}</ul></section>
        <section><h2 className="font-serif text-2xl">Learning outcomes</h2><ul className="mt-3 list-disc space-y-2 pl-6">{course.outcomes.map((item, index) => <li key={index}>{item}</li>)}</ul></section>
      </div>
      {!preview && <div className="flex flex-wrap gap-4">
        <Link href={`/courses/enquiry?course=${course.slug}`} className="rounded-full bg-forest px-6 py-3 font-semibold text-white">Enquire Now</Link>
        <Link href={`/courses/application?course=${course.slug}`} className="rounded-full border border-forest px-6 py-3 font-semibold">Apply Now</Link>
      </div>}
    </article>
  );
}


import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicCourse } from "../../../../features/courses/service";
import { CourseContent } from "../../../../features/courses/course-content";

export const dynamic = "force-dynamic";
const courseBySlug = cache(getPublicCourse);
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const course = await courseBySlug((await params).slug);
  return course ? { title: course.title + " | Institute for Ecommerce", description: course.summary, alternates: { canonical: "/courses/" + course.slug } } : { title: "Course not found", robots: { index: false } };
}
export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const course = await courseBySlug((await params).slug);
  if (!course) notFound();
  return <CourseContent course={course} />;
}

import { notFound } from "next/navigation";
import { getAdminCourse } from "../../../../../../features/courses/service";
import { CourseContent } from "../../../../../../features/courses/course-content";
export default async function PreviewCourse({ params }: { params: Promise<{ id: string }> }) {
  const course = await getAdminCourse((await params).id);
  if (!course) notFound();
  return <><p role="status" className="mx-auto max-w-5xl px-6 pt-8">Staff preview · {course.status}</p><CourseContent course={course} preview /></>;
}

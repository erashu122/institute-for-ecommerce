import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, getAdminCourse } from "../../../../../../features/courses/service";
import { CourseForm, PublicationControls, DeleteCourse } from "../../../../../../features/courses/course-form";
import { currentStaff } from "../../../../../../server/auth";

export default async function EditCourse({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const course = await getAdminCourse((await params).id);
  if (!course) notFound();
  const staff = await currentStaff();
  return <section className="mx-auto max-w-6xl px-6 py-12"><h1 className="font-serif text-4xl">Edit course</h1>
    {(await searchParams).saved === "1" && <p className="my-5" role="status">Course saved.</p>}
    <p className="my-4">Status — {course.status === "DRAFT" ? "Draft" : "Published"}</p>
    <Link className="underline" href={`/admin/courses/${course.id}/preview`}>Preview course</Link>
    <CourseForm course={course} categories={await categories(true)} />
    {staff?.role === "ADMIN" && <><PublicationControls id={course.id} status={course.status} /><DeleteCourse id={course.id} /></>}
  </section>;
}

import { categories } from "../../../../../features/courses/service";
import { CourseForm } from "../../../../../features/courses/course-form";
export default async function NewCourse() {
  return <section className="mx-auto max-w-6xl px-6 py-12"><h1 className="font-serif text-4xl">Add course</h1><p className="mt-4">New courses start as drafts.</p><CourseForm categories={await categories(true)} /></section>;
}

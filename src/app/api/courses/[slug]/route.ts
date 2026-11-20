import { getPublicCourse } from "../../../../features/courses/service";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const course = await getPublicCourse((await context.params).slug);
    return course ? Response.json(course) : Response.json({ error: "Course not found." }, { status: 404 });
  } catch {
    return Response.json({ error: "Course is temporarily unavailable." }, { status: 503 });
  }
}

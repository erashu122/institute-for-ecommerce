import { ZodError } from "zod";
import { listCourses } from "../../../features/courses/service";

export async function GET(request: Request) {
  try {
    const params = Object.fromEntries(new URL(request.url).searchParams);
    return Response.json(await listCourses(params));
  } catch (error) {
    if (error instanceof ZodError) return Response.json({ error: "Invalid course filters." }, { status: 400 });
    return Response.json({ error: "Courses are temporarily unavailable." }, { status: 503 });
  }
}

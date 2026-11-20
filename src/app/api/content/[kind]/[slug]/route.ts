import { kindSchema } from "../../../../../features/content/schema";
import { getContent } from "../../../../../features/content/service";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kind: string; slug: string }> },
) {
  const query = await params;
  const kind = kindSchema.safeParse(query.kind);
  if (!kind.success)
    return Response.json({ error: "Content type not found." }, { status: 404 });
  try {
    const entry = await getContent(kind.data, query.slug);
    return entry
      ? Response.json(entry)
      : Response.json({ error: "Content not found." }, { status: 404 });
  } catch {
    return Response.json({ error: "Content unavailable." }, { status: 503 });
  }
}

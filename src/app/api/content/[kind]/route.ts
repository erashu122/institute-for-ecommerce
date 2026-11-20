import { ZodError } from "zod";
import { kindSchema } from "../../../../features/content/schema";
import { listContent } from "../../../../features/content/service";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  const kind = kindSchema.safeParse((await params).kind);
  if (!kind.success)
    return Response.json({ error: "Content type not found." }, { status: 404 });
  try {
    return Response.json(
      await listContent(
        kind.data,
        Object.fromEntries(new URL(request.url).searchParams),
      ),
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof ZodError
            ? "Invalid filters."
            : "Content unavailable.",
      },
      { status: error instanceof ZodError ? 400 : 503 },
    );
  }
}

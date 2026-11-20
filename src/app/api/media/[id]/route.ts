import { readImage } from "../../../../features/media/service";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const image = await readImage((await params).id);
    if (!image) return new Response("Image not found", { status: 404 });
    return new Response(new Uint8Array(image.buffer), {
      headers: {
        "Content-Type": image.mimeType,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Image unavailable", { status: 503 });
  }
}

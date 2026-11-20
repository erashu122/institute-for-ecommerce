"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { eventInputToIso } from "./events";
import { saveContent, publishContent, deleteContent } from "./service";
import { uploadImage } from "../media/service";
import { detailFields, kindSchema, routes, type ContentKind } from "./schema";
import { CourseError } from "../courses/permissions";

export type CmsState = {
  message: string;
  fields?: Record<string, string>;
  imageId?: string;
  imageAlt?: string;
};
function failure(error: unknown): CmsState {
  if (error instanceof ZodError)
    return {
      message: "Check the highlighted fields.",
      fields: Object.fromEntries(
        error.issues.map((issue) => [issue.path.join("."), issue.message]),
      ),
    };
  if (error instanceof CourseError) return { message: error.message };
  return {
    message:
      "The change could not be saved. Check configuration and try again.",
  };
}
function refresh(kind: ContentKind) {
  revalidatePath(routes[kind], "layout");
  revalidatePath("/testimonials");
  revalidatePath("/admin/content", "layout");
}
export async function saveContentAction(
  kind: ContentKind,
  id: string | null,
  version: number,
  _previous: CmsState,
  form: FormData,
): Promise<CmsState> {
  let saved: string;
  try {
    kindSchema.parse(kind);
    const raw = Object.fromEntries(form);
    const details = Object.fromEntries(
      detailFields[kind].map((field) => {
        const value = String(raw[field.name] ?? "");
        return [
          field.name,
          kind === "events" && ["startsAt", "endsAt"].includes(field.name)
            ? eventInputToIso(value)
            : value,
        ];
      }),
    );
    saved = await saveContent(kind, id, version, { ...raw, details });
  } catch (error) {
    return failure(error);
  }
  refresh(kind);
  redirect(`/admin/content/${kind}/${saved}/edit?saved=1`);
}
export async function publishContentAction(
  kind: ContentKind,
  id: string,
  version: number,
  _previous: CmsState,
  form: FormData,
): Promise<CmsState> {
  try {
    const status = form.get("status");
    if (status !== "DRAFT" && status !== "PUBLISHED")
      throw new CourseError("INVALID", "Choose a valid status.");
    await publishContent(kind, id, version, status);
    refresh(kind);
    return {
      message:
        status === "PUBLISHED"
          ? kind === "testimonials"
            ? "Testimonial approved."
            : "Content published."
          : "Content unpublished.",
    };
  } catch (error) {
    return failure(error);
  }
}
export async function deleteContentAction(
  kind: ContentKind,
  id: string,
  version: number,
  _previous: CmsState,
  form: FormData,
): Promise<CmsState> {
  try {
    if (form.get("confirmation") !== "DELETE")
      throw new CourseError("INVALID", "Type DELETE to confirm.");
    await deleteContent(kind, id, version);
  } catch (error) {
    return failure(error);
  }
  refresh(kind);
  redirect(`/admin/content/${kind}?deleted=1`);
}
export async function uploadContentImage(
  _previous: CmsState,
  form: FormData,
): Promise<CmsState> {
  try {
    const file = form.get("file");
    if (!(file instanceof File)) return { message: "Choose an image file." };
    const image = await uploadImage(file, String(form.get("alt") ?? ""));
    return {
      message: "Image uploaded and selected. Save content to attach it.",
      imageId: image.id,
      imageAlt: image.alt,
    };
  } catch {
    return {
      message:
        "Upload failed. Use a valid PNG, JPEG or WebP up to 5 MB, provide alternative text, and check media storage configuration.",
    };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { saveCourse, changeCourseStatus, deleteCourse } from "./service";
import { CourseError } from "./permissions";

export type ActionState = { message: string; errors?: Record<string, string[]> };
function failure(error: unknown): ActionState {
  if (error instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = String(issue.path[0]);
      (errors[key] ??= []).push(issue.message);
    }
    return { message: "Check the highlighted fields.", errors };
  }
  if (error instanceof CourseError) return { message: error.message };
  return { message: "The change could not be saved. Please try again." };
}
function refresh() {
  revalidatePath("/courses", "layout");
  revalidatePath("/admin/courses", "layout");
}
export async function saveAction(id: string | null, _previous: ActionState, form: FormData): Promise<ActionState> {
  let savedId: string;
  try {
    const data = Object.fromEntries(form);
    savedId = await saveCourse(id, {
      ...data,
      curriculum: String(data.curriculum ?? "").split(/\r?\n/).filter(line => line.trim()),
      outcomes: String(data.outcomes ?? "").split(/\r?\n/).filter(line => line.trim()),
    });
  } catch (error) { return failure(error); }
  refresh();
  redirect(`/admin/courses/${savedId}/edit?saved=1`);
}
export async function statusAction(id: string, _previous: ActionState, form: FormData): Promise<ActionState> {
  try {
    const status = form.get("status");
    if (status !== "DRAFT" && status !== "PUBLISHED") throw new CourseError("INVALID", "Choose a valid status.");
    await changeCourseStatus(id, status);
    refresh();
    return { message: status === "PUBLISHED" ? "Course published." : "Course unpublished." };
  } catch (error) { return failure(error); }
}
export async function deleteAction(id: string, _previous: ActionState, form: FormData): Promise<ActionState> {
  try {
    if (form.get("confirmation") !== "DELETE") throw new CourseError("INVALID", "Type DELETE to confirm.");
    await deleteCourse(id);
  } catch (error) { return failure(error); }
  refresh();
  redirect("/admin/courses?deleted=1");
}

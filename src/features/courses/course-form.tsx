"use client";

import { useActionState } from "react";
import { saveAction, statusAction, deleteAction } from "./actions";
import { modes, type CourseDetail } from "./schema";
import { modeLabels } from "./course-card";

type Category = { id: string; name: string };
export function CourseForm({ course, categories }: { course?: CourseDetail; categories: Category[] }) {
  const [state, action, pending] = useActionState(saveAction.bind(null, course?.id ?? null), { message: "" });
  const fields = [
    ["title", "Title", course?.title ?? ""],
    ["slug", "Slug", course?.slug ?? ""],
    ["duration", "Duration", course?.duration ?? ""],
    ["fee", "Fee in INR", course?.fee ?? ""],
    ["image", "Image URL (optional, HTTPS)", course?.image ?? ""],
  ];
  return <form action={action} className="mt-8 grid max-w-3xl gap-5">
    {state.message && <p role="alert" className="rounded-lg border p-4">{state.message}</p>}
    {fields.map(([name, label, value]) => <label key={name} className="grid gap-2 font-semibold">{label}
      <input name={name} defaultValue={value} required={name !== "image"} maxLength={name === "image" ? 2000 : name === "title" ? 160 : 100} aria-invalid={Boolean(state.errors?.[name])} aria-describedby={state.errors?.[name] ? name + "-error" : undefined} className="rounded-lg border bg-white p-3 font-normal" />
      {state.errors?.[name] && <span id={name + "-error"} className="text-sm">{state.errors[name].join(" ")}</span>}
    </label>)}
    <label className="grid gap-2 font-semibold">Category<select name="categoryId" defaultValue={course?.category.id ?? ""} required className="rounded-lg border bg-white p-3 font-normal"><option value="" disabled>Choose a category</option>{categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{state.errors?.categoryId && <span>{state.errors.categoryId.join(" ")}</span>}</label>
    <label className="grid gap-2 font-semibold">Delivery mode<select name="mode" defaultValue={course?.mode ?? "ONLINE"} className="rounded-lg border bg-white p-3 font-normal">{modes.map(mode => <option key={mode} value={mode}>{modeLabels[mode]}</option>)}</select></label>
    {[
      ["summary", "Summary", course?.summary ?? "", 400],
      ["description", "Description", course?.description ?? "", 20000],
      ["eligibility", "Eligibility", course?.eligibility ?? "", 2000],
      ["curriculum", "Curriculum (one item per line)", course?.curriculum.join("\n") ?? "", 25000],
      ["outcomes", "Learning outcomes (one item per line)", course?.outcomes.join("\n") ?? "", 25000],
    ].map(([name, label, value, max]) => <label key={String(name)} className="grid gap-2 font-semibold">{label}
      <textarea name={String(name)} defaultValue={String(value)} maxLength={Number(max)} required rows={4} aria-invalid={Boolean(state.errors?.[String(name)])} aria-describedby={state.errors?.[String(name)] ? name + "-error" : undefined} className="rounded-lg border bg-white p-3 font-normal" />
      {state.errors?.[String(name)] && <span id={name + "-error"} className="text-sm">{state.errors[String(name)].join(" ")}</span>}
    </label>)}
    <button disabled={pending || !categories.length} className="w-fit rounded-full bg-forest px-6 py-3 font-semibold text-white disabled:opacity-50">{pending ? "Saving…" : "Save course"}</button>
    {!categories.length && <p>Add course categories through the development seed before creating a course.</p>}
  </form>;
}

export function PublicationControls({ id, status }: { id: string; status: "DRAFT" | "PUBLISHED" }) {
  const [state, action, pending] = useActionState(statusAction.bind(null, id), { message: "" });
  return <form action={action} className="my-8 flex flex-wrap items-center gap-4"><input type="hidden" name="status" value={status === "DRAFT" ? "PUBLISHED" : "DRAFT"} /><button disabled={pending} className="rounded-full border px-5 py-3 disabled:opacity-50">{pending ? "Updating…" : status === "DRAFT" ? "Publish" : "Unpublish"}</button><p role="status">{state.message}</p></form>;
}
export function DeleteCourse({ id }: { id: string }) {
  const [state, action, pending] = useActionState(deleteAction.bind(null, id), { message: "" });
  return <details className="mt-12 max-w-3xl rounded-xl border p-5"><summary className="cursor-pointer font-semibold">Delete course</summary><p className="my-4">Deletion is permanent. Type DELETE to confirm.</p><form action={action} className="grid gap-4"><label className="grid gap-2">Confirmation<input name="confirmation" required pattern="DELETE" className="rounded-lg border bg-white p-3" /></label><button disabled={pending} className="w-fit rounded-full border px-6 py-3">{pending ? "Deleting…" : "Permanently delete course"}</button><p role="alert">{state.message}</p></form></details>;
}

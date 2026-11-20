"use client";

import { useActionState, useState } from "react";
import { eventInputValue } from "./events";
import {
  saveContentAction,
  publishContentAction,
  deleteContentAction,
  uploadContentImage,
} from "./actions";
import { detailFields, type ContentEntry, type ContentKind } from "./schema";

export function ContentForm({
  kind,
  entry,
  categories,
  images,
  imageId,
  onImageChange,
}: {
  kind: ContentKind;
  entry?: ContentEntry;
  categories: { id: string; title: string }[];
  images: { id: string; alt: string }[];
  imageId: string;
  onImageChange: (value: string) => void;
}) {
  const [state, action, pending] = useActionState(
    saveContentAction.bind(null, kind, entry?.id ?? null, entry?.version ?? 0),
    { message: "" },
  );
  const titleLabel =
    kind === "faculty" || kind === "testimonials"
      ? "Name"
      : kind === "faqs"
        ? "Question"
        : "Title";
  const bodyLabel =
    kind === "faqs"
      ? "Answer"
      : kind === "testimonials"
        ? "Testimonial"
        : kind === "pages"
          ? "Institute profile"
          : "Content";
  const fields = [
    {
      name: "title",
      label: titleLabel,
      value: entry?.title ?? "",
      max: 200,
      required: true,
    },
    {
      name: "slug",
      label: "Slug",
      value: entry?.slug ?? (kind === "pages" ? "about" : ""),
      max: 120,
      required: true,
    },
    {
      name: "summary",
      label: "Summary",
      value: entry?.summary ?? "",
      max: 600,
      required: false,
    },
    {
      name: "sortOrder",
      label: "Display order",
      value: String(entry?.sortOrder ?? 0),
      max: 5,
      required: true,
    },
  ];
  return (
    <form action={action} className="mt-8 grid max-w-3xl gap-5">
      <p>
        Saving changes returns content to draft for review. Content supports
        Markdown headings, lists, emphasis and links. Raw HTML is omitted.
      </p>
      {state.message && (
        <p role="alert" className="rounded-lg border p-4">
          {state.message}
        </p>
      )}
      {fields.map((field) => (
        <div key={field.name} className="grid gap-2">
          <label htmlFor={field.name} className="font-semibold">
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            defaultValue={field.value}
            maxLength={field.max}
            required={field.required}
            readOnly={kind === "pages" && field.name === "slug"}
            type={field.name === "sortOrder" ? "number" : "text"}
            min={field.name === "sortOrder" ? 0 : undefined}
            max={field.name === "sortOrder" ? 10000 : undefined}
            aria-invalid={Boolean(state.fields?.[field.name])}
            aria-describedby={
              state.fields?.[field.name] ? field.name + "-error" : undefined
            }
            className="rounded-lg border bg-white p-3"
          />
          {state.fields?.[field.name] && (
            <p id={field.name + "-error"}>{state.fields[field.name]}</p>
          )}
        </div>
      ))}
      <div className="grid gap-2">
        <label htmlFor="imageId" className="font-semibold">
          Image
        </label>
        <select
          id="imageId"
          name="imageId"
          value={imageId}
          onChange={(event) => onImageChange(event.target.value)}
          className="rounded-lg border bg-white p-3"
        >
          <option value="">No image</option>
          {images.map((image) => (
            <option key={image.id} value={image.id}>
              {image.alt}
            </option>
          ))}
        </select>
        {state.fields?.imageId && <p>{state.fields.imageId}</p>}
      </div>
      {kind === "blog" && (
        <div className="grid gap-2">
          <label htmlFor="categoryId" className="font-semibold">
            Blog category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={entry?.categoryId ?? ""}
            className="rounded-lg border bg-white p-3"
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="grid gap-2">
        <label htmlFor="body" className="font-semibold">
          {bodyLabel}
        </label>
        <textarea
          id="body"
          name="body"
          defaultValue={entry?.body ?? ""}
          required
          maxLength={50000}
          rows={10}
          aria-invalid={Boolean(state.fields?.body)}
          className="rounded-lg border bg-white p-3"
        />
        {state.fields?.body && <p>{state.fields.body}</p>}
      </div>
      {detailFields[kind].map((field) => (
        <div key={field.name} className="grid gap-2">
          <label htmlFor={field.name} className="font-semibold">
            {field.label}
          </label>
          {kind === "events" && ["startsAt", "endsAt"].includes(field.name) ? (
            <input
              type="datetime-local"
              step="1"
              id={field.name}
              name={field.name}
              defaultValue={eventInputValue(entry?.details[field.name] ?? "")}
              required={field.required}
              className="rounded-lg border bg-white p-3"
            />
          ) : (
            <textarea
              id={field.name}
              name={field.name}
              defaultValue={entry?.details[field.name] ?? ""}
              required={field.required}
              rows={kind === "pages" ? 4 : 2}
              maxLength={4000}
              aria-invalid={Boolean(
                state.fields?.["details." + field.name] ||
                  state.fields?.[field.name],
              )}
              className="rounded-lg border bg-white p-3"
            />
          )}
          {(state.fields?.["details." + field.name] ||
            state.fields?.[field.name]) && (
            <p>
              {state.fields?.["details." + field.name] ||
                state.fields?.[field.name]}
            </p>
          )}
        </div>
      ))}
      <button
        disabled={pending}
        className="w-fit rounded-full bg-forest px-6 py-3 font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save content"}
      </button>
    </form>
  );
}
export function ContentControls({
  kind,
  entry,
}: {
  kind: ContentKind;
  entry: ContentEntry;
}) {
  const [publishState, publishAction, publishing] = useActionState(
    publishContentAction.bind(null, kind, entry.id, entry.version),
    { message: "" },
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteContentAction.bind(null, kind, entry.id, entry.version),
    { message: "" },
  );
  const label =
    entry.status === "PUBLISHED"
      ? "Unpublish"
      : kind === "testimonials"
        ? "Approve testimonial"
        : "Publish";
  return (
    <div className="my-10 max-w-3xl">
      <form action={publishAction} className="grid justify-items-start gap-4">
        <input
          type="hidden"
          name="status"
          value={entry.status === "DRAFT" ? "PUBLISHED" : "DRAFT"}
        />
        <button disabled={publishing} className="rounded-full border px-6 py-3">
          {publishing ? "Updating…" : label}
        </button>
        <p role="status">{publishState.message}</p>
      </form>
      <details className="mt-8 rounded-lg border p-5">
        <summary className="cursor-pointer">Delete content</summary>
        <form action={deleteAction} className="mt-5 grid gap-4">
          <label className="grid gap-2">
            Type DELETE to confirm
            <input
              name="confirmation"
              required
              pattern="DELETE"
              className="rounded-lg border bg-white p-3"
            />
          </label>
          <button
            disabled={deleting}
            className="w-fit rounded-full border px-6 py-3"
          >
            {deleting ? "Deleting…" : "Permanently delete content"}
          </button>
          <p role="alert">{deleteState.message}</p>
        </form>
      </details>
    </div>
  );
}
export function MediaUpload({
  onUploaded,
}: {
  onUploaded: (id: string, alt: string) => void;
}) {
  const [state, action, pending] = useActionState(
    async (
      previous: { message: string; imageId?: string; imageAlt?: string },
      form: FormData,
    ) => {
      const next = await uploadContentImage(previous, form);
      if (next.imageId)
        onUploaded(next.imageId, next.imageAlt ?? "Uploaded image");
      return next;
    },
    { message: "" },
  );
  return (
    <details className="mt-8 max-w-3xl rounded-lg border p-5">
      <summary className="cursor-pointer font-semibold">Upload image</summary>
      <form action={action} className="mt-5 grid gap-4">
        <label className="grid gap-2">
          Image file
          <input
            type="file"
            name="file"
            accept="image/png,image/jpeg,image/webp"
            required
          />
        </label>
        <label className="grid gap-2">
          Alternative text
          <input
            name="alt"
            required
            maxLength={300}
            className="rounded-lg border bg-white p-3"
          />
        </label>
        <p>PNG, JPEG or WebP · maximum 5 MB.</p>
        <button
          disabled={pending}
          className="w-fit rounded-full border px-6 py-3"
        >
          {pending ? "Uploading…" : "Upload image"}
        </button>
        <p role="status">{state.message}</p>
      </form>
    </details>
  );
}

export function ContentEditor({
  kind,
  entry,
  categories,
  images,
}: {
  kind: ContentKind;
  entry?: ContentEntry;
  categories: { id: string; title: string }[];
  images: { id: string; alt: string }[];
}) {
  const [imageId, setImageId] = useState(entry?.imageId ?? "");
  const [uploaded, setUploaded] = useState<{ id: string; alt: string }[]>([]);
  const options = Array.from(
    new Map(
      [...images, ...(entry?.image ? [entry.image] : []), ...uploaded].map(
        (image) => [image.id, image],
      ),
    ).values(),
  );
  return (
    <>
      <MediaUpload
        onUploaded={(id, alt) => {
          setUploaded((current) => [
            ...current.filter((image) => image.id !== id),
            { id, alt },
          ]);
          setImageId(id);
        }}
      />
      <ContentForm
        kind={kind}
        entry={entry}
        categories={categories}
        images={options}
        imageId={imageId}
        onImageChange={setImageId}
      />
    </>
  );
}

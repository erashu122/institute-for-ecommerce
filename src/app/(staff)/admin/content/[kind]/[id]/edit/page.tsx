import { mediaOptions } from "../../../../../../../features/media/service";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageStaff } from "../../../../../../../server/auth/page";
import { kindSchema } from "../../../../../../../features/content/schema";
import {
  getContent,
  blogCategoryOptions,
} from "../../../../../../../features/content/service";
import {
  ContentEditor,
  ContentControls,
} from "../../../../../../../features/content/forms";
export default async function EditContent({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string; id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const staff = await requirePageStaff();
  const query = await params;
  const kind = kindSchema.safeParse(query.kind);
  if (!kind.success) notFound();
  const entry = await getContent(kind.data, query.id, true);
  if (!entry) notFound();
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-serif text-4xl">Edit content</h1>
      {(await searchParams).saved === "1" && (
        <p role="status" className="my-5">
          Content saved as draft.
        </p>
      )}
      <p className="my-4">
        Status ·{" "}
        {entry.status === "DRAFT"
          ? "Draft"
          : kind.data === "testimonials"
            ? "Approved"
            : "Published"}
      </p>
      <Link
        className="underline"
        href={`/admin/content/${kind.data}/${entry.id}/preview`}
      >
        Preview content
      </Link>
      <ContentEditor
        key={entry.version}
        kind={kind.data}
        entry={entry}
        categories={kind.data === "blog" ? await blogCategoryOptions(true) : []}
        images={await mediaOptions()}
      />
      {staff.role === "ADMIN" && (
        <ContentControls kind={kind.data} entry={entry} />
      )}
    </section>
  );
}

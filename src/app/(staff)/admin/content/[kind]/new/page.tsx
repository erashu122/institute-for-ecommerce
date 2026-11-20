import { mediaOptions } from "../../../../../../features/media/service";
import { notFound } from "next/navigation";
import { requirePageStaff } from "../../../../../../server/auth/page";
import {
  kindSchema,
  kindLabels,
} from "../../../../../../features/content/schema";
import { blogCategoryOptions } from "../../../../../../features/content/service";
import { ContentEditor } from "../../../../../../features/content/forms";
export default async function NewContent({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  await requirePageStaff();
  const kind = kindSchema.safeParse((await params).kind);
  if (!kind.success) notFound();
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-serif text-4xl">Add {kindLabels[kind.data]}</h1>
      <ContentEditor
        kind={kind.data}
        categories={kind.data === "blog" ? await blogCategoryOptions(true) : []}
        images={await mediaOptions()}
      />
    </section>
  );
}

import { notFound } from "next/navigation";
import { requirePageStaff } from "../../../../../../../server/auth/page";
import { kindSchema } from "../../../../../../../features/content/schema";
import { getContent } from "../../../../../../../features/content/service";
import { ContentArticle } from "../../../../../../../features/content/public";
export default async function PreviewContent({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  await requirePageStaff();
  const query = await params;
  const kind = kindSchema.safeParse(query.kind);
  if (!kind.success) notFound();
  const entry = await getContent(kind.data, query.id, true);
  if (!entry) notFound();
  return (
    <>
      <p className="mx-auto max-w-4xl px-6 pt-8" role="status">
        Staff preview · {entry.status}
      </p>
      <ContentArticle kind={kind.data} entry={entry} />
    </>
  );
}

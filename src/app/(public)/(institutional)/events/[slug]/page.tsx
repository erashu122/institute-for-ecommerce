import {
  DetailPage,
  detailMetadata,
} from "../../../../../features/content/public";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return detailMetadata("events", (await params).slug);
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <DetailPage kind="events" params={params} />;
}

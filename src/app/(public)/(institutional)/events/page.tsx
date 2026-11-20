import { CollectionPage } from "../../../../features/content/public";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Events | Institute for Ecommerce",
  description: "Explore the institute's events.",
  alternates: { canonical: "/events" },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CollectionPage kind="events" searchParams={searchParams} />;
}

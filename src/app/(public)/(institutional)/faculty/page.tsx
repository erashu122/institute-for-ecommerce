import { CollectionPage } from "../../../../features/content/public";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Faculty | Institute for Ecommerce",
  description: "Explore the institute's faculty.",
  alternates: { canonical: "/faculty" },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CollectionPage kind="faculty" searchParams={searchParams} />;
}

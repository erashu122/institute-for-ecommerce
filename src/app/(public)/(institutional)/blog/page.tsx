import { CollectionPage } from "../../../../features/content/public";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Blog | Institute for Ecommerce",
  description: "Explore the institute's blog.",
  alternates: { canonical: "/blog" },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CollectionPage kind="blog" searchParams={searchParams} />;
}

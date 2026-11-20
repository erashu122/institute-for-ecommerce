import { CollectionPage } from "../../../../features/content/public";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Frequently asked questions | Institute for Ecommerce",
  description: "Explore the institute's faqs.",
  alternates: { canonical: "/faqs" },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CollectionPage kind="faqs" searchParams={searchParams} />;
}

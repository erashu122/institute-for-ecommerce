import { CollectionPage } from "../../../../features/content/public";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Testimonials | Institute for Ecommerce",
  description: "Explore the institute's testimonials.",
  alternates: { canonical: "/testimonials" },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CollectionPage kind="testimonials" searchParams={searchParams} />;
}

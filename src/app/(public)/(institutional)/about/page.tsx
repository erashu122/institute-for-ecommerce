import { AboutPage, detailMetadata } from "../../../../features/content/public";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return detailMetadata("pages", "about");
}
export default AboutPage;

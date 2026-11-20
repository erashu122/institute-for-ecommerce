import Link from "next/link";
export const metadata = { title: "Course enquiries", robots: { index: false } };
export default function Placeholder() {
  return <section className="mx-auto max-w-6xl px-6 py-16"><h1 className="font-serif text-3xl">Course enquiries</h1><p className="my-5">Online submissions are coming soon. This form will be available when the institute opens online intake.</p><Link className="underline" href="/courses">Back to courses</Link></section>;
}

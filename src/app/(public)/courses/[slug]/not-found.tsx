import Link from "next/link";
export default function NotFound() {
  return <section className="mx-auto max-w-6xl px-6 py-16"><h1 className="font-serif text-3xl">Course not found</h1><Link className="mt-5 inline-block underline" href="/courses">Browse courses</Link></section>;
}

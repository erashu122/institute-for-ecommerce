"use client";
export default function AdminError({ reset }: { reset: () => void }) {
  return <section className="mx-auto max-w-6xl px-6 py-12"><h1 className="font-serif text-3xl">Course management is temporarily unavailable</h1><button className="mt-5 rounded-full border px-6 py-3" onClick={reset}>Try again</button></section>;
}

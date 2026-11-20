"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-serif text-3xl">
        Content is temporarily unavailable
      </h1>
      <p className="my-4">Please try again in a moment.</p>
      <button
        className="rounded-full bg-forest px-6 py-3 text-white"
        onClick={reset}
      >
        Try again
      </button>
    </section>
  );
}

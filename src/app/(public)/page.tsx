export default function HomePage() {
  return (
    <>
      <section className="bg-forest text-white">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28 lg:py-36">
          <h1 className="max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight sm:text-7xl">
            Learn how ecommerce works
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
            Explore how online stores reach customers, sell products, and manage day-to-day operations.
          </p>
          <a className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 font-semibold text-ink hover:bg-white" href="#about">
            About the institute
          </a>
        </div>
      </section>

      <section id="about" aria-labelledby="about-title" className="mx-auto grid max-w-6xl gap-5 px-6 py-14 sm:px-10 sm:py-20 md:grid-cols-[1fr_1.4fr]">
        <h2 id="about-title" className="font-serif text-3xl tracking-tight sm:text-4xl">About the institute</h2>
        <p className="max-w-xl text-lg leading-relaxed">
          The Institute for Ecommerce focuses on the skills behind online retail, from digital marketing and storefront management to order fulfillment.
        </p>
      </section>
    </>
  );
}

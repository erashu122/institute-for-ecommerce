"use client";

import { useState } from "react";
import { RichText } from "./rich-text";

export function FaqItem({
  id,
  title,
  body,
}: {
  id: string;
  title: string;
  body: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const buttonId = "faq-question-" + id;
  const answerId = "faq-answer-" + id;
  return (
    <section className="rounded-xl border p-5">
      <h2>
        <button
          type="button"
          id={buttonId}
          aria-expanded={expanded}
          aria-controls={answerId}
          onClick={() => setExpanded((current) => !current)}
          className="w-full text-left font-semibold"
        >
          {title}
        </button>
      </h2>
      <div
        id={answerId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!expanded}
        className="mt-4"
      >
        <RichText text={body} />
      </div>
    </section>
  );
}

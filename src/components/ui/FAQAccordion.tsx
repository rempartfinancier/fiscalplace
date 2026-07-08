export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Accessible accordion built on native <details>/<summary> (keyboard-ready,
 * no JS) + FAQPage JSON-LD for SEO.
 */
export function FAQAccordion({ items, className = "" }: { items: FAQItem[]; className?: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  return (
    <div className={className}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="divide-y divide-rule rounded-[6px] border border-rule bg-white">
        {items.map((item) => (
          <details key={item.question} className="group px-5 py-4 open:bg-paper/60">
            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 text-[16px] font-medium text-ink [&::-webkit-details-marker]:hidden">
              {item.question}
              <span
                aria-hidden="true"
                className="shrink-0 font-mono text-mine transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-mine">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

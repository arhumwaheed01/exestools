import { SITE_FAQS } from "@/lib/faqs";

export function FAQSection() {
  return (
    <section className="max-w-3xl" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl font-bold tracking-tight text-foreground">
        Frequently asked questions
      </h2>
      <div className="mt-6 space-y-3">
        {SITE_FAQS.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-border bg-surface px-4 py-3 open:border-accent/40"
          >
            <summary className="cursor-pointer list-none text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent rounded marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                {item.q}
                <span className="text-muted transition group-open:rotate-45" aria-hidden>
                  +
                </span>
              </span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

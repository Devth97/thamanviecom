"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Are Thamanvi Silks sarees 100% pure silk?",
    a: "Yes. Every saree is sourced directly from authentic weaving regions — Kanjivaram from Kanchipuram, Banarasi from Varanasi, and Mysore Silk from Karnataka's silk farms. Each product page lists fabric type, weave, and zari purity.",
  },
  {
    q: "Does Thamanvi Silks offer Cash on Delivery (COD)?",
    a: "Yes, COD is available across India on eligible pincodes. You can check delivery and COD availability for your area directly on any product page using the pincode checker.",
  },
  {
    q: "What is the exchange and return policy?",
    a: "We offer an open box return and free exchange policy — you can inspect your saree on delivery before accepting, and exchanges are hassle-free if the fit or color isn't right.",
  },
  {
    q: "How long does delivery take?",
    a: "Local delivery in and around Puttur, Karnataka typically takes 1–2 days. Standard delivery across India takes 4–6 days. Exact estimates are shown when you enter your pincode on any product page.",
  },
  {
    q: "Where is Thamanvi Silks located?",
    a: "Our store is at Ground Floor, Bappalige Tower, Bypass Road, Bappalige, Mani, Puttur, Karnataka 574201. We're rated 4.8★ on Google with 421+ reviews.",
  },
  {
    q: "Can I get a blouse stitched with my saree?",
    a: "Yes, blouse pieces are included with most sarees, and our team can guide you on measurements and draping styles via WhatsApp — just ask before or after your purchase.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-[#FAF6F0] py-12 md:py-16 border-t border-[#B8860B]/10">
      <div className="mx-auto max-w-3xl px-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-8 bg-[#B8860B]" />
          <span className="text-[#8B1A1A] text-xs tracking-[0.25em] uppercase">Common Questions</span>
        </div>
        <h2 className="font-display text-2xl md:text-4xl text-[#0D0808] mb-8">Frequently Asked Questions</h2>

        <div className="divide-y divide-[#B8860B]/15 border-y border-[#B8860B]/15">
          {FAQS.map(({ q, a }, i) => (
            <div key={q}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="w-full flex items-center justify-between gap-4 py-4 text-left"
              >
                <span className="font-medium text-[#0D0808] text-sm md:text-base">{q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[#8B1A1A] transition-transform ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <p className="pb-4 text-sm text-[#555] leading-relaxed">{a}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAQPage schema — read by Google AI Overviews, ChatGPT, Perplexity, and search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map(({ q, a }) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: { "@type": "Answer", text: a },
            })),
          }),
        }}
      />
    </section>
  );
}

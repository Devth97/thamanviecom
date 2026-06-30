import { Metadata } from "next";
import { GOOGLE_RATING, GOOGLE_REVIEW_COUNT } from "@/data/googleReviews";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Thamanvi Silks is a saree store in Puttur, Karnataka, founded in 2023. We source authentic Kanjivaram, Banarasi & Mysore silk sarees directly from weavers across India.",
  alternates: { canonical: "https://thamanvi.com/about" },
};

export default function AboutPage() {
  return (
    <main className="bg-[#FAF6F0] min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-6">
        <span className="text-[#8B1A1A] text-xs tracking-[0.25em] uppercase">Our Story</span>
        <h1 className="font-display text-3xl md:text-5xl text-[#0D0808] mt-2 mb-6">About Thamanvi Silks</h1>

        <div className="prose prose-sm md:prose-base max-w-none text-[#444] space-y-4 leading-relaxed">
          <p>
            Thamanvi Silks &amp; Sarees was founded in 2023 in Puttur, Karnataka, with a simple goal:
            bring authentic, pure silk sarees — Kanjivaram, Banarasi, and Mysore Silk — directly to
            customers without compromising on quality or pricing them out of reach.
          </p>
          <p>
            Every saree we sell is sourced directly from weaving regions known for the craft —
            Kanjivaram from Kanchipuram, Banarasi from Varanasi, and Mysore Silk from Karnataka&apos;s
            own silk farms. We personally select each design for weave quality, zari purity, and
            finish before it reaches our store.
          </p>
          <p>
            We&apos;re rated {GOOGLE_RATING}★ on Google from {GOOGLE_REVIEW_COUNT}+ customer reviews,
            and our customers consistently mention the same things: genuine fabric, fair pricing, and
            staff who take the time to help you find the right saree rather than rush a sale.
          </p>
          <p>
            Whether you&apos;re shopping for a wedding, a festival, or everyday wear, we offer Cash on
            Delivery, free shipping across India, and an open-box return policy so you can be confident
            in what you&apos;re buying — even online.
          </p>
        </div>

        <div className="mt-10 border-t border-[#B8860B]/20 pt-8">
          <h2 className="font-display text-xl text-[#0D0808] mb-3">Visit Our Store</h2>
          <p className="text-sm text-[#444] leading-relaxed">
            Ground Floor, Bappalige Tower, Bypass Road, Bappalige, Mani,<br />
            Puttur, Karnataka 574201
          </p>
          <p className="text-sm text-[#444] mt-2">
            Phone / WhatsApp:{" "}
            <a href="https://wa.me/919535779597" className="text-[#8B1A1A] underline underline-offset-2">
              +91 95357 79597
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

"use client";

import { motion } from "framer-motion";
import { GOOGLE_REVIEWS, GOOGLE_RATING, GOOGLE_REVIEW_COUNT } from "@/data/googleReviews";

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 22 },
  },
};

export default function ProductReviews() {
  return (
    <section className="border-t border-[#B8860B]/10 py-10 md:py-14 overflow-hidden">
      <div className="mx-auto max-w-3xl px-6">
        <div className="flex items-center gap-3 mb-8">
          <span className="flex text-[#B8860B] text-lg">
            {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
          </span>
          <span className="text-[#0D0808] font-semibold">{GOOGLE_RATING}</span>
          <span className="text-[#666] text-sm">
            from {GOOGLE_REVIEW_COUNT} Google reviews
          </span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-5 sm:grid-cols-2"
        >
          {GOOGLE_REVIEWS.map(({ name, quote }, i) => (
            // Outer: entrance + stagger (variants, parent-controlled)
            <motion.div key={name} variants={cardVariants} className="will-change-transform">
              {/* Inner: continuous float loop + hover lift (own animate/whileHover, no conflict) */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 4 + (i % 3),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
                whileHover={{
                  scale: 1.04,
                  y: -8,
                  boxShadow: "0px 16px 36px rgba(139, 26, 26, 0.18)",
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
                className="bg-white border border-[#B8860B]/15 rounded-lg p-4 md:p-5 shadow-sm cursor-default"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="flex text-[#B8860B] text-xs">
                    {"★★★★★".split("").map((s, idx) => <span key={idx}>{s}</span>)}
                  </span>
                  <span className="text-sm font-medium text-[#0D0808]">{name}</span>
                </div>
                <p className="text-sm text-[#444] leading-relaxed line-clamp-5">&quot;{quote}&quot;</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <a
          href="https://www.google.com/search?q=Thamanvi+Silks+Puttur+reviews"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block text-sm text-[#8B1A1A] underline underline-offset-2"
        >
          Read all Google reviews →
        </a>
      </div>
    </section>
  );
}

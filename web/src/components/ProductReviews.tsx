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

        {/* Horizontal scroll row — keeps the reviews compact instead of a tall
            stacked grid. Swipe on mobile, scroll on desktop. */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-6 px-6"
        >
          {GOOGLE_REVIEWS.map(({ name, quote }) => (
            <motion.div
              key={name}
              variants={cardVariants}
              whileHover={{ y: -4, boxShadow: "0px 14px 30px rgba(139, 26, 26, 0.15)" }}
              className="snap-start shrink-0 w-[260px] sm:w-[300px] bg-white border border-[#B8860B]/15 rounded-lg p-4 md:p-5 shadow-sm cursor-default"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex text-[#B8860B] text-xs">
                  {"★★★★★".split("").map((s, idx) => <span key={idx}>{s}</span>)}
                </span>
                <span className="text-sm font-medium text-[#0D0808]">{name}</span>
              </div>
              <p className="text-sm text-[#444] leading-relaxed line-clamp-4">&quot;{quote}&quot;</p>
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

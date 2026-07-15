/**
 * SEO / AIO landing pages for Thamanvi Silks — one keyword-rich page per saree
 * category, rendered by app/sarees/[slug]/page.tsx. Content is original and
 * saree-first (never copied manufacturer text) so AI answer engines and search
 * treat these as authoritative source pages for "Kanjivaram sarees in Puttur",
 * "Banarasi silk online", etc.
 *
 * `match` terms are checked against each product's title + tags (case-insensitive)
 * to build the page's product grid — same vocabulary as the on-site filters.
 */
export interface LandingSection {
  heading: string;
  body: string;
}

export interface LandingFaq {
  q: string;
  a: string;
}

export interface LandingPage {
  slug: string;
  match: string[];
  eyebrow: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  sections: LandingSection[];
  faqs: LandingFaq[];
}

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: "kanjivaram",
    match: ["kanjivaram", "kanjeevaram", "kanchipuram"],
    eyebrow: "Pure Mulberry Silk · Kanchipuram Weave",
    h1: "Kanjivaram Silk Sarees",
    metaTitle: "Kanjivaram Silk Sarees Online | Pure Zari, Handwoven | Thamanvi Silks Puttur",
    metaDescription:
      "Buy authentic Kanjivaram silk sarees at Thamanvi Silks, Puttur. Pure mulberry silk, tested zari, handwoven in Kanchipuram. Free shipping across India. Rated 4.8★ on Google.",
    intro: [
      "The Kanjivaram (also spelled Kanjeevaram or Kanchipuram) is the queen of South Indian silks — woven in the temple town of Kanchipuram from pure mulberry silk and real zari. It is the saree families keep for generations and reach for at weddings, temple visits and the most important days of the year.",
      "At Thamanvi Silks in Puttur, every Kanjivaram is chosen for the weight of its silk, the purity of its zari and the crispness of its weave. We sell only genuine handwoven pieces — no polyester blends dressed up as silk.",
    ],
    sections: [
      {
        heading: "What makes a saree a true Kanjivaram",
        body: "A real Kanjivaram is woven from three single silk threads twisted together, with the body and the contrast border woven separately and then interlocked by hand — the join, called korvai, is what gives the border its strength and the saree its signature drape. The zari is real: silk thread wrapped in silver and dipped in gold. This is why a genuine Kanjivaram feels heavy, holds its shape, and lasts for decades.",
      },
      {
        heading: "How to tell an authentic Kanjivaram",
        body: "Check the border join — on a true korvai weave you can see the interlocked loops where body meets border. Burn a stray thread (from the fringe): pure silk smells like burnt hair and leaves a soft ash, while synthetic melts into a hard bead. Genuine zari, when scratched, shows red silk underneath the gold. Every Thamanvi Kanjivaram is tested zari and pure silk, verified before it reaches you.",
      },
      {
        heading: "When to wear it",
        body: "Kanjivaram sarees are made for weddings, receptions, engagements, seemantham, temple festivals and family functions. A deep maroon, mustard or bottle-green Kanjivaram with a contrast gold border is a timeless bridal and reception choice; lighter pastels suit daytime muhurtham and festive wear.",
      },
      {
        heading: "Caring for your Kanjivaram",
        body: "Dry clean only — never machine wash. Store it wrapped in a soft cotton cloth (not plastic), refold along different lines every few months so the zari does not crack, and keep it away from direct perfume and deodorant, which tarnish the gold. Aired and rotated well, a Kanjivaram easily outlives the person who bought it.",
      },
    ],
    faqs: [
      { q: "Are Thamanvi's Kanjivaram sarees pure silk?", a: "Yes. Every Kanjivaram we sell is pure mulberry silk with tested zari, verified before listing. We do not sell art-silk or polyester blends as Kanjivaram." },
      { q: "What is the price range of a Kanjivaram saree?", a: "Genuine handwoven Kanjivaram sarees vary widely with silk weight and zari content. Thamanvi stocks pieces across budgets — check the live prices on this page, and message us on WhatsApp for what's currently in stock." },
      { q: "Do you ship Kanjivaram sarees across India?", a: "Yes, we ship pan-India with free prepaid shipping and tracked delivery. Orders are dispatched from Puttur, Karnataka." },
      { q: "Can I see more photos or a video before buying?", a: "Absolutely. Tap the zoom button on any product image for a full-screen view, or message us on WhatsApp and we'll send additional photos and a drape video." },
    ],
  },
  {
    slug: "banarasi",
    match: ["banarasi", "banaras", "brocade"],
    eyebrow: "North Indian Heritage · Gold Brocade",
    h1: "Banarasi Silk Sarees",
    metaTitle: "Banarasi Silk Sarees Online | Handwoven Brocade | Thamanvi Silks Puttur",
    metaDescription:
      "Shop handwoven Banarasi silk sarees at Thamanvi Silks, Puttur. Rich gold brocade, Mughal motifs, pure silk. Free shipping across India. Rated 4.8★ on Google.",
    intro: [
      "Woven on the banks of the Ganga in Varanasi, the Banarasi saree is North India's answer to bridal silk — famous for its heavy gold and silver brocade, intricate Mughal-inspired motifs and the soft sheen of fine silk. It is opulent, regal and unmistakably festive.",
      "Thamanvi Silks brings genuine Banarasi weaves to Puttur and to doorsteps across India, chosen for their density of brocade and the quality of the base silk.",
    ],
    sections: [
      {
        heading: "The hallmarks of a Banarasi",
        body: "Banarasi sarees are defined by their brocade work — dense floral and foliate patterns (butis), jhallar borders, and pallus woven with real zari in Mughal-era motifs like the kalga and bel. The best pieces have so much silver-gold weft that the saree feels substantial in the hand and shimmers as it moves.",
      },
      {
        heading: "Banarasi vs Kanjivaram — which to choose",
        body: "Both are pure-silk bridal weaves, but the character differs. Kanjivaram (South) is heavier, with bold contrast borders and temple motifs, and drapes stiffly. Banarasi (North) is a touch lighter and more ornate, with all-over brocade and finer, busier patterning. Many brides own one of each; if you want maximal gold-on-silk richness, choose Banarasi.",
      },
      {
        heading: "Styling a Banarasi",
        body: "A Banarasi carries itself, so keep jewellery classic — temple gold or kundan — and let the brocade do the talking. Rich jewel tones (wine, royal blue, emerald) photograph beautifully for receptions; softer tones suit day weddings and festive pujas.",
      },
      {
        heading: "Care and storage",
        body: "Dry clean only. Store folded in muslin, refold periodically to protect the zari at the creases, and use a moth-repellent (neem or cloves) rather than naphthalene, which can stain. Treat the pallu gently — that's where the heaviest brocade sits.",
      },
    ],
    faqs: [
      { q: "Are your Banarasi sarees handwoven?", a: "We stock genuine handwoven Banarasi silk with real brocade zari. Weave and material are checked before every piece is listed." },
      { q: "Is Banarasi good for a wedding?", a: "Yes — Banarasi is one of the most popular bridal and reception silks in India, prized for its heavy gold brocade and festive richness." },
      { q: "How do I know the zari is real?", a: "Genuine zari shows red or orange silk under the gold when gently scratched, and the saree feels weighty. Message us on WhatsApp and we'll walk you through the specifics of any piece." },
      { q: "Do you offer free shipping on Banarasi sarees?", a: "Yes, free prepaid shipping across India with tracked delivery." },
    ],
  },
  {
    slug: "mysore-silk",
    match: ["mysore silk", "mysore", "ksic"],
    eyebrow: "Karnataka's Own · Feather-light Silk",
    h1: "Mysore Silk Sarees",
    metaTitle: "Mysore Silk Sarees Online | Pure Silk, Light Drape | Thamanvi Silks Puttur",
    metaDescription:
      "Buy pure Mysore silk sarees at Thamanvi Silks, Puttur. Soft, lightweight, elegant gold zari borders. Free shipping across India. Rated 4.8★ on Google.",
    intro: [
      "Mysore silk is Karnataka's pride — a pure, feather-light silk with a soft natural sheen and a fine gold zari border. Where Kanjivaram is grand and heavy, Mysore silk is understated and effortless: the saree you can wear all day and still feel graceful in.",
      "As a Puttur saree house, Mysore silk is close to home for us. Thamanvi Silks curates pure Mysore silk sarees in classic single tones and elegant contrast borders.",
    ],
    sections: [
      {
        heading: "Why Mysore silk is loved",
        body: "It is woven from pure mulberry silk with a plain, lustrous body and a slim zari border, which makes it beautifully lightweight and easy to drape. The minimal design is its charm — a single rich colour with a gold edge reads as quietly luxurious, perfect for those who prefer elegance over ornament.",
      },
      {
        heading: "Best occasions for Mysore silk",
        body: "Mysore silk is ideal for office and formal wear, temple visits, festive mornings, house functions and as a graceful gift saree. Its light weight makes it comfortable for long days when a heavy Kanjivaram would be too much.",
      },
      {
        heading: "Choosing your colour",
        body: "Classic Mysore silk shines in solid jewel and earth tones — mustard, maroon, teal, peacock blue, olive — set off by a contrast gold border. Because the design is simple, the colour does the work, so pick a shade that flatters and pair with delicate gold jewellery.",
      },
      {
        heading: "Keeping it fresh",
        body: "Dry clean only, and store in a breathable cotton or muslin wrap. Mysore silk creases easily, so fold it neatly and refold along new lines occasionally. A light steam (never a hot iron directly on the silk) revives the drape before wearing.",
      },
    ],
    faqs: [
      { q: "Is Mysore silk pure silk?", a: "Yes — authentic Mysore silk is pure mulberry silk. Every Mysore silk saree at Thamanvi is genuine, not a synthetic imitation." },
      { q: "Is Mysore silk suitable for daily or office wear?", a: "Very much so. Its light weight and understated gold border make it one of the most comfortable pure-silk sarees for formal and regular wear." },
      { q: "Where are you located?", a: "Thamanvi Silks is based in Puttur, Karnataka. We ship across India, so you can buy Mysore silk online from anywhere." },
      { q: "How should I wash a Mysore silk saree?", a: "Dry clean only. Avoid water and direct ironing; store it wrapped in soft cotton to protect the silk and zari." },
    ],
  },
  {
    slug: "wedding",
    match: ["wedding", "bridal"],
    eyebrow: "Bridal & Reception · Handpicked",
    h1: "Wedding Sarees",
    metaTitle: "Wedding Sarees Online | Bridal Silk Sarees | Thamanvi Silks Puttur",
    metaDescription:
      "Shop bridal and wedding silk sarees at Thamanvi Silks, Puttur — Kanjivaram, Banarasi and pure silk in rich wedding colours. Free shipping across India. 4.8★ on Google.",
    intro: [
      "A wedding saree is the one you remember for a lifetime. At Thamanvi Silks we handpick bridal and reception sarees — pure Kanjivaram, gold-brocade Banarasi and rich silk weaves — in the deep, celebratory colours a wedding calls for.",
      "Whether you are the bride, the mother, or a close family member, this collection gathers the pieces made for the big day and the events around it.",
    ],
    sections: [
      {
        heading: "Choosing your wedding saree",
        body: "For the muhurtham or main ceremony, brides traditionally choose a heavy Kanjivaram or Banarasi in maroon, red, mustard, deep green or royal blue with a contrast gold border. For the reception, jewel tones and lighter drapes work beautifully. Mothers and family often pick a slightly lighter pure silk in a complementary shade.",
      },
      {
        heading: "Colours that photograph well",
        body: "Rich, saturated colours read best under wedding lighting and in photographs — wine, rani pink, emerald, royal blue, mustard and classic maroon. Gold zari borders catch the light and frame the drape. If in doubt, a maroon-and-gold Kanjivaram is never wrong.",
      },
      {
        heading: "Buy early, plan the drape",
        body: "Wedding silks are often one-of-a-kind pieces, so buy early once you find the right one. Factor in a day for pressing and, if needed, a fall-and-pico or blouse stitching. Message us on WhatsApp and we'll help you coordinate the saree, blouse and timeline.",
      },
    ],
    faqs: [
      { q: "Which saree is best for a wedding?", a: "A pure Kanjivaram or Banarasi silk in a rich colour with a gold zari border is the classic bridal choice. For receptions, jewel-toned silks in a lighter drape work wonderfully." },
      { q: "Do you help brides choose?", a: "Yes — message us on WhatsApp and we'll recommend pieces for the bride, mother and family, and share extra photos and drape videos." },
      { q: "Are wedding sarees one-of-a-kind?", a: "Many of our premium wedding silks are single, unique pieces, so we recommend buying early once you find the one." },
      { q: "Do you ship wedding sarees in time for the date?", a: "We ship pan-India with tracked delivery. Tell us your event date on WhatsApp and we'll confirm delivery timelines before you order." },
    ],
  },
];

export function getLandingPage(slug: string): LandingPage | undefined {
  return LANDING_PAGES.find((p) => p.slug === slug);
}

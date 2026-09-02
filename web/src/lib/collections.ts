/**
 * The saree collections — the single source of truth for BOTH the "Our
 * Collections" cards and the quick-link chips at the top of the homepage.
 *
 * Keeping one list means adding a category is a one-place change and the chips
 * can never drift out of sync with the cards.
 *
 * `href` filters the Shop All grid. Each new category matches its own FULL
 * Shopify tag (e.g. "Fancy Saree") rather than a single word, so menswear and
 * other fabrics can't leak in — plain "Cotton" used to match the men's
 * cotton-linen shirts.
 */
export type SareeCollection = {
  num: string;
  handle: string;
  /** Shop All link with the category filter pre-applied. */
  href: string;
  /** Card title. */
  title: string;
  /** Shorter label for the homepage quick-link chips. */
  pill: string;
  origin: string;
  desc: string;
  image: string;
  /** The exact Shopify tag a product needs to appear here. */
  tag: string;
};

export const SAREE_COLLECTIONS: SareeCollection[] = [
  { num: "01", handle: "kanjivaram-silk", href: "/?type=Kanjivaram#shop", title: "Kanjivaram Silk", pill: "Kanjivaram", origin: "Kanchipuram, TN", desc: "Pure mulberry silk with gold zari. The queen of Indian sarees.", image: "/collections/kanjivaram-silk.png", tag: "Kanjivaram" },
  { num: "02", handle: "banarasi-silk", href: "/?type=Banarasi#shop", title: "Banarasi Silk", pill: "Banarasi", origin: "Varanasi, UP", desc: "Royal brocade weaving with intricate motifs from the holy city.", image: "/collections/banarasi-silk.png", tag: "Banarasi" },
  { num: "03", handle: "mysore-silk", href: "/?type=Mysore Silk#shop", title: "Mysore Silk", pill: "Mysore Silk", origin: "Mysuru, Karnataka", desc: "Lustrous silk with pure gold zari, the pride of Karnataka.", image: "/collections/mysore-silk.png", tag: "Mysore Silk" },
  { num: "04", handle: "wedding-silk", href: "/?occasion=Wedding#shop", title: "Bridal Collection", pill: "Wedding", origin: "Curated Selection", desc: "The most auspicious sarees for your most treasured moments.", image: "/collections/wedding-silk.png", tag: "Wedding" },
  { num: "05", handle: "casual-cotton", href: "/?fabric=Cotton Saree#shop", title: "Cotton Weaves", pill: "Cotton Weaves", origin: "South India", desc: "Lightweight elegance for everyday grace and comfort.", image: "/collections/casual-cotton.jpg", tag: "Cotton Saree" },
  { num: "06", handle: "fancy-saree", href: "/?fabric=Fancy Saree#shop", title: "Fancy Saree", pill: "Fancy Saree", origin: "Party & Occasion", desc: "Contemporary designs with modern drape and detailing.", image: "/collections/fancy-saree.jpg", tag: "Fancy Saree" },
  { num: "07", handle: "tissue-saree", href: "/?fabric=Tissue Saree#shop", title: "Tissue Saree", pill: "Tissue Saree", origin: "Festive Shimmer", desc: "Sheer, lightweight weave with a soft metallic glow.", image: "/collections/tissue-saree.jpg", tag: "Tissue Saree" },
  { num: "08", handle: "crepe-saree", href: "/?fabric=Crepe Saree#shop", title: "Crepe Saree", pill: "Crepe Saree", origin: "Soft & Flowing", desc: "Fluid, feather-light fabric that drapes beautifully.", image: "/collections/crepe-saree.jpg", tag: "Crepe Saree" },
  { num: "09", handle: "semi-silk-saree", href: "/?fabric=Semi Silk Saree#shop", title: "Semi Silk Saree", pill: "Semi Silk", origin: "Everyday Elegance", desc: "The sheen of silk with easy, everyday comfort.", image: "/collections/semi-silk-saree.jpg", tag: "Semi Silk Saree" },
];

/** Quick-link chips at the top of the homepage: "All Sarees" + every collection. */
export const SAREE_QUICK_LINKS = [
  { label: "All Sarees", href: "/#shop" },
  ...SAREE_COLLECTIONS.map((c) => ({ label: c.pill, href: c.href })),
];

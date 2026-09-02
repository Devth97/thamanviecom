/**
 * The saree collections — the single source of truth for ALL THREE places a
 * category appears:
 *   1. the "Our Collections" cards on the homepage
 *   2. the quick-link chips above them
 *   3. the "Type" checkboxes in the Shop All filter sidebar
 *
 * Adding a category here makes it appear in all three at once, so they can
 * never drift apart.
 *
 * `tag` is the exact Shopify tag a product needs. Each saree category uses its
 * FULL tag (e.g. "Fancy Saree") rather than a single word, so menswear and other
 * fabrics can't leak in — plain "Cotton" used to match the men's cotton-linen
 * shirts. Matching is case-insensitive, against the product's tags or its title.
 */
export type SareeCollection = {
  num: string;
  handle: string;
  /** Which filter slot this category drives. */
  param: "type" | "occasion";
  /** The exact Shopify tag a product needs to appear here. */
  tag: string;
  /** Card title. */
  title: string;
  /** Shorter label for the homepage quick-link chips. */
  pill: string;
  origin: string;
  desc: string;
  image: string;
};

const COLLECTIONS: SareeCollection[] = [
  { num: "01", handle: "kanjivaram-silk", param: "type", tag: "Kanjivaram", title: "Kanjivaram Silk", pill: "Kanjivaram", origin: "Kanchipuram, TN", desc: "Pure mulberry silk with gold zari. The queen of Indian sarees.", image: "/collections/kanjivaram-silk.png" },
  { num: "02", handle: "banarasi-silk", param: "type", tag: "Banarasi", title: "Banarasi Silk", pill: "Banarasi", origin: "Varanasi, UP", desc: "Royal brocade weaving with intricate motifs from the holy city.", image: "/collections/banarasi-silk.png" },
  { num: "03", handle: "mysore-silk", param: "type", tag: "Mysore Silk", title: "Mysore Silk", pill: "Mysore Silk", origin: "Mysuru, Karnataka", desc: "Lustrous silk with pure gold zari, the pride of Karnataka.", image: "/collections/mysore-silk.png" },
  { num: "04", handle: "wedding-silk", param: "occasion", tag: "Wedding", title: "Bridal Collection", pill: "Wedding", origin: "Curated Selection", desc: "The most auspicious sarees for your most treasured moments.", image: "/collections/wedding-silk.png" },
  { num: "05", handle: "casual-cotton", param: "type", tag: "Cotton Saree", title: "Cotton Weaves", pill: "Cotton Weaves", origin: "South India", desc: "Lightweight elegance for everyday grace and comfort.", image: "/collections/casual-cotton.jpg" },
  { num: "06", handle: "fancy-saree", param: "type", tag: "Fancy Saree", title: "Fancy Saree", pill: "Fancy Saree", origin: "Party & Occasion", desc: "Contemporary designs with modern drape and detailing.", image: "/collections/fancy-saree.jpg" },
  { num: "07", handle: "tissue-saree", param: "type", tag: "Tissue Saree", title: "Tissue Saree", pill: "Tissue Saree", origin: "Festive Shimmer", desc: "Sheer, lightweight weave with a soft metallic glow.", image: "/collections/tissue-saree.jpg" },
  { num: "08", handle: "crepe-saree", param: "type", tag: "Crepe Saree", title: "Crepe Saree", pill: "Crepe Saree", origin: "Soft & Flowing", desc: "Fluid, feather-light fabric that drapes beautifully.", image: "/collections/crepe-saree.jpg" },
  { num: "09", handle: "semi-silk-saree", param: "type", tag: "Semi Silk Saree", title: "Semi Silk Saree", pill: "Semi Silk", origin: "Everyday Elegance", desc: "The sheen of silk with easy, everyday comfort.", image: "/collections/semi-silk-saree.jpg" },
];

/** Shop All link with this category's filter pre-applied. */
export const collectionHref = (c: SareeCollection) => `/?${c.param}=${c.tag}#shop`;

export const SAREE_COLLECTIONS = COLLECTIONS.map((c) => ({ ...c, href: collectionHref(c) }));

/** Quick-link chips: "All Sarees" + every collection. */
export const SAREE_QUICK_LINKS = [
  { label: "All Sarees", href: "/#shop" },
  ...SAREE_COLLECTIONS.map((c) => ({ label: c.pill, href: c.href })),
];

/**
 * "Type" checkboxes in the filter sidebar — every category except the Bridal
 * one, which is an occasion. Kurta/Kurta Set are deliberately NOT here: the
 * Shop All grid excludes menswear, so those boxes could only ever return zero.
 */
export const SAREE_TYPE_FILTERS = COLLECTIONS.filter((c) => c.param === "type").map((c) => c.tag);

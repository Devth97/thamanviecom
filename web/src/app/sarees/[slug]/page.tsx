import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProducts, type ShopifyProduct } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";
import { LANDING_PAGES, getLandingPage } from "@/lib/landingPages";

export const revalidate = 60;

const BASE_URL = "https://thamanvi.com";

export function generateStaticParams() {
  return LANDING_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) return { title: "Not found" };
  const url = `${BASE_URL}/sarees/${page.slug}`;
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url,
      type: "website",
    },
  };
}

/** Match products to a landing page by its terms against title + tags. */
function matchProducts(products: ShopifyProduct[], terms: string[]): ShopifyProduct[] {
  const lowered = terms.map((t) => t.toLowerCase());
  return products.filter((p) => {
    const haystack = `${p.title} ${p.tags.join(" ")}`.toLowerCase();
    return lowered.some((t) => haystack.includes(t));
  });
}

export default async function SareeLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) notFound();

  const { products: all } = await getProducts({
    first: 100,
    sortKey: "CREATED_AT",
    reverse: true,
  }).catch(() => ({ products: [] as ShopifyProduct[], hasNextPage: false, endCursor: null }));

  const products = matchProducts(all, page.match);
  const url = `${BASE_URL}/sarees/${page.slug}`;
  const others = LANDING_PAGES.filter((p) => p.slug !== page.slug);

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-[#E8DDD0] bg-[#FAF6F0] pt-16">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <nav className="flex items-center gap-2 text-xs text-[#999]" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#8B1A1A]">Home</Link>
            <span>/</span>
            <Link href="/#shop" className="hover:text-[#8B1A1A]">Sarees</Link>
            <span>/</span>
            <span className="text-[#666]">{page.h1}</span>
          </nav>
        </div>
      </div>

      <main className="bg-[#FAF6F0]">
        {/* Hero / intro */}
        <section className="mx-auto max-w-4xl px-4 md:px-8 pt-8 md:pt-12 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-6 bg-[#B8860B]" />
            <span className="text-[#B8860B] text-[10px] tracking-[0.25em] uppercase">{page.eyebrow}</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl text-[#0D0808] mb-4">{page.h1}</h1>
          <div className="space-y-3 text-[#4A4A4A] leading-relaxed">
            {page.intro.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* Product grid */}
        <section id="shop" className="mx-auto max-w-6xl px-4 md:px-8 py-6 scroll-mt-16">
          {products.length > 0 ? (
            <>
              <h2 className="font-display text-xl md:text-2xl text-[#0D0808] mb-4">
                {page.h1} in stock
                <span className="ml-2 text-sm font-sans text-[#666]">
                  ({products.length} available)
                </span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} surface="collection" />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-[#E8DDD0] bg-white px-6 py-10 text-center">
              <p className="text-[#666] mb-3">
                New {page.h1.toLowerCase()} are arriving soon.
              </p>
              <Link href="/#shop" className="text-sm text-[#8B1A1A] underline underline-offset-2">
                Browse all sarees
              </Link>
            </div>
          )}
        </section>

        {/* Editorial content */}
        <section className="mx-auto max-w-3xl px-4 md:px-8 py-8 space-y-8">
          {page.sections.map((s) => (
            <div key={s.heading}>
              <h2 className="font-display text-xl md:text-2xl text-[#0D0808] mb-2">{s.heading}</h2>
              <p className="text-[#4A4A4A] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 md:px-8 pb-10">
          <h2 className="font-display text-2xl md:text-3xl text-[#0D0808] mb-4">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-[#E8DDD0] border-y border-[#E8DDD0]">
            {page.faqs.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer items-center justify-between text-[#1A1A1A] font-medium list-none">
                  {f.q}
                  <span className="ml-4 text-[#B8860B] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-[#4A4A4A] leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Internal links to sibling landing pages */}
        <section className="mx-auto max-w-4xl px-4 md:px-8 pb-14">
          <h2 className="text-[#B8860B] text-[10px] tracking-[0.25em] uppercase mb-3">Explore more</h2>
          <div className="flex flex-wrap gap-2">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/sarees/${o.slug}`}
                className="rounded-full border border-[#D4A96A]/60 px-4 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#8B1A1A] hover:text-white hover:border-[#8B1A1A] transition-colors"
              >
                {o.h1}
              </Link>
            ))}
            <Link
              href="/#shop"
              className="rounded-full border border-[#D4A96A]/60 px-4 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#8B1A1A] hover:text-white hover:border-[#8B1A1A] transition-colors"
            >
              Shop all sarees
            </Link>
          </div>
        </section>
      </main>

      {/* JSON-LD: Breadcrumb + FAQ + collection listing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
              { "@type": "ListItem", position: 2, name: page.h1, item: url },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: page.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
      {products.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: page.metaTitle,
              description: page.metaDescription,
              url,
              mainEntity: {
                "@type": "ItemList",
                numberOfItems: products.length,
                itemListElement: products.map((p, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  url: `${BASE_URL}/products/${p.handle}`,
                  name: p.title,
                })),
              },
            }),
          }}
        />
      )}
    </>
  );
}

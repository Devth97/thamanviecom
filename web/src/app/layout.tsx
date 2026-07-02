import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import PostHogProvider from "@/components/PostHogProvider";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { CartProvider } from "@/contexts/CartContext";
import { GOOGLE_RATING, GOOGLE_REVIEW_COUNT } from "@/data/googleReviews";
import "./globals.css";

// ── Retargeting pixel IDs ──
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "3272610399588521";
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "AW-18284564481";

const SITE_URL = "https://thamanvi.com";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Thamanvi Silks | Saree Shop in Puttur | Kanjivaram Silk",
    template: "%s | Thamanvi Silks",
  },
  description:
    "Saree shop in Puttur, Karnataka with authentic Kanjivaram, Banarasi & Mysore silk sarees. 4.8★ on Google. Free shipping across India.",
  keywords: [
    "saree shop", "saree shop near me", "saree shop puttur", "saree shop karnataka",
    "saree", "buy saree online", "silk saree", "kanjivaram saree", "banarasi saree",
    "mysore silk saree", "wedding saree", "thamanvi silks", "pure silk saree online india",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Thamanvi Silks",
    url: SITE_URL,
    title: "Thamanvi Silks | Saree Shop in Puttur | Kanjivaram Silk",
    description:
      "Saree shop in Puttur, Karnataka with authentic Kanjivaram, Banarasi & Mysore silk sarees. 4.8★ on Google. Free shipping across India.",
    images: [{ url: "/logo-512.png", width: 512, height: 512, alt: "Thamanvi Silks" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Thamanvi Silks | Buy Sarees Online",
    description: "Authentic Kanjivaram, Banarasi & Mysore Silk sarees. Rated 4.8★ on Google.",
    images: ["/logo-512.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
        {/* ── LocalBusiness structured data — powers Google Maps/Search rich results
            and is what AI answer engines (ChatGPT, Perplexity, Google AI Overviews)
            read to answer "saree shop in Puttur" / "is Thamanvi Silks real" queries ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ClothingStore",
              "@id": `${SITE_URL}/#business`,
              name: "Thamanvi Silks",
              alternateName: "Thamanvi Silks & Sarees",
              url: SITE_URL,
              logo: `${SITE_URL}/logo-512.png`,
              image: `${SITE_URL}/logo-512.png`,
              description:
                "Authentic Kanjivaram, Banarasi, and Mysore silk sarees. Traditional and modern collections for weddings and festive wear.",
              telephone: "+919535779597",
              priceRange: "₹₹₹",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Ground Floor, Bappalige Tower, Bypass Road, Bappalige",
                addressLocality: "Puttur",
                addressRegion: "Karnataka",
                postalCode: "574201",
                addressCountry: "IN",
              },
              areaServed: "IN",
              geo: {
                "@type": "GeoCoordinates",
                latitude: 12.7632858,
                longitude: 75.2018421,
              },
              hasMap: "https://www.google.com/maps?q=Bappalige+Tower+Bypass+Road+Bappalige+Mani+Puttur+Karnataka+574201",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: GOOGLE_RATING,
                reviewCount: GOOGLE_REVIEW_COUNT,
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                  opens: "10:00",
                  closes: "20:00",
                },
              ],
              sameAs: [
                "https://wa.me/919535779597",
              ],
            }),
          }}
        />
        {/* ── Meta Pixel (Instagram + Facebook retargeting) ── */}
        {META_PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">{`
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
              document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init','${META_PIXEL_ID}');
              fbq('track','PageView');
            `}</Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img height="1" width="1" style={{display:"none"}} alt=""
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}
        {/* ── Google Ads retargeting tag (YouTube + Search + Display) ── */}
        {GOOGLE_ADS_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`} strategy="afterInteractive" />
            <Script id="google-ads" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GOOGLE_ADS_ID}');
            `}</Script>
          </>
        )}
        <body className="bg-[#FAF6F0] text-[#1A1A1A] font-sans antialiased pb-16 md:pb-0">
          <PostHogProvider>
            <CartProvider>
            <Navbar />
            {children}
            <footer className="bg-[#0D0808] border-t border-[#B8860B]/10 py-12">
              <div className="mx-auto max-w-7xl px-6 md:px-12">
                <div className="grid md:grid-cols-4 gap-8 mb-10">
                  <div className="md:col-span-2">
                    <div className="font-display text-2xl text-white tracking-[0.2em] mb-3">THAMANVI</div>
                    <p className="text-white/40 text-sm leading-relaxed max-w-xs">Premium silk sarees from Puttur, Karnataka. Authentic craftsmanship since 2023.</p>
                    <div className="flex gap-4 mt-4">
                      <a href="https://wa.me/919535779597" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-[#B8860B] text-xs tracking-widest uppercase transition-colors">WhatsApp</a>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white/60 text-xs tracking-[0.2em] uppercase mb-4">Collections</h4>
                    <div className="space-y-2">
                      {[
                        { label: "Kanjivaram Silk", href: "/?type=Kanjivaram#shop" },
                        { label: "Banarasi Silk", href: "/?type=Banarasi#shop" },
                        { label: "Mysore Silk", href: "/?type=Mysore Silk#shop" },
                        { label: "Bridal", href: "/?occasion=Wedding#shop" },
                      ].map(({ label, href }) => (
                        <div key={label}><a href={href} className="text-white/40 hover:text-[#B8860B] text-sm transition-colors">{label}</a></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white/60 text-xs tracking-[0.2em] uppercase mb-4">Info</h4>
                    <div className="space-y-2">
                      {[["About", "/about"], ["Contact", "https://wa.me/919535779597"], ["Privacy", "/privacy"], ["Refund Policy", "/refund"]].map(([label, href]) => (
                        <div key={label}><a href={href} className="text-white/40 hover:text-[#B8860B] text-sm transition-colors">{label}</a></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="border-t border-[#B8860B]/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
                  <p className="text-white/20 text-xs">© 2026 Thamanvi Silks. All rights reserved.</p>
                  <p className="text-white/20 text-xs">Ground Floor, Bappalige Tower, Puttur, Karnataka 574201</p>
                </div>
              </div>
            </footer>
            <BottomNav />
            </CartProvider>
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

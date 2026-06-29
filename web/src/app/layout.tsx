import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Playfair_Display } from "next/font/google";
import PostHogProvider from "@/components/PostHogProvider";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { CartProvider } from "@/contexts/CartContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Thamanvi Silks | Premium Sarees & Silk", template: "%s | Thamanvi Silks" },
  description: "Authentic silk sarees from Thamanvi Silks, Puttur. Kanjivaram, Banarasi, Mysore Silk & more. Free shipping. 100% pure silk.",
  keywords: ["saree", "silk saree", "kanjivaram", "puttur", "karnataka", "thamanvi silks"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Thamanvi Silks",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
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
                      {["Kanjivaram Silk", "Banarasi Silk", "Mysore Silk", "Bridal"].map(c => (
                        <div key={c}><a href="/collections/kanjivaram-silk" className="text-white/40 hover:text-[#B8860B] text-sm transition-colors">{c}</a></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white/60 text-xs tracking-[0.2em] uppercase mb-4">Info</h4>
                    <div className="space-y-2">
                      {[["About", "/#heritage"], ["Contact", "https://wa.me/919535779597"], ["Privacy", "/privacy"], ["Refund Policy", "/refund"]].map(([label, href]) => (
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

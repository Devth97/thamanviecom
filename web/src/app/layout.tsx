import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: { default: "Thamanvi Silks | Premium Sarees & Silk", template: "%s | Thamanvi Silks" },
  description: "Authentic silk sarees from Thamanvi Silks, Puttur. Kanjivaram, Banarasi, Mysore Silk & more. Free exchanges. 30-year legacy.",
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
        <body className="bg-[#FDF6EE] text-[#1A1A1A] font-sans antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

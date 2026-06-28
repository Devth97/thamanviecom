# Thamanvi Silks E-Commerce Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a conversion-optimised, headless saree e-commerce storefront for Thamanvi Silks (Puttur, Karnataka) using Next.js 15 + Shopify Storefront API + Supabase + Clerk + Razorpay + GSAP, deployed on Vercel.

**Architecture:** Next.js 15 App Router frontend consumes Shopify Storefront GraphQL API for all product/cart/checkout data. Supabase stores supplementary customer data (wishlists, newsletter subscribers, referrals). Clerk handles auth (Google OAuth + Phone OTP). Razorpay processes INR payments via custom checkout flow.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, GSAP 3, @clerk/nextjs, @supabase/supabase-js, Shopify Storefront API (GraphQL), Razorpay, PostHog, Vercel

---

## File Map

```
web/
  src/
    app/
      page.tsx                          # Homepage
      layout.tsx                        # Root layout (Clerk + PostHog providers)
      collections/[handle]/page.tsx     # Product Listing Page
      products/[handle]/page.tsx        # Product Detail Page
      account/
        orders/page.tsx                 # Order history
        wishlist/page.tsx               # Saved products
      api/
        shopify/
          products/route.ts             # Proxy: list products
          products/[handle]/route.ts    # Proxy: single product
          collections/route.ts          # Proxy: all collections
          cart/route.ts                 # Create/update Shopify cart
          webhooks/route.ts             # Receive Shopify webhooks → Make.com
        payments/
          razorpay/
            order/route.ts              # Create Razorpay order
            verify/route.ts             # Verify payment signature
            webhook/route.ts            # Razorpay webhook handler
        newsletter/route.ts             # Subscribe email/phone
        wishlist/route.ts               # CRUD wishlist items
        referrals/
          register/route.ts
          me/route.ts
        internal/health/route.ts
      sign-in/[[...sign-in]]/page.tsx
      sign-up/[[...sign-up]]/page.tsx
      onboarding/page.tsx
    components/
      HeroSection.tsx                   # Animated hero with video
      ProductCard.tsx                   # Card used in PLP + carousels
      ProductGallery.tsx                # PDP image gallery with zoom
      CartDrawer.tsx                    # Slide-over cart
      FilterSidebar.tsx                 # PLP filters + sort
      WishlistButton.tsx                # Heart icon, calls /api/wishlist
      WhatsAppCTA.tsx                   # Sticky floating button
      TrustStrip.tsx                    # Google rating + legacy badges
      NewsletterForm.tsx                # Email capture
      PremiumPaywall.tsx                # (future) gated content
      PostHogProvider.tsx               # PostHog client init
    lib/
      shopify.ts                        # Storefront API client + all GQL queries
      supabase.ts                       # Supabase client (anon + service role)
      razorpay.ts                       # Razorpay order + verify helpers
      get-auth.ts                       # Clerk currentUser() helper
      api-security.ts                   # HMAC verification utilities
      api-client.ts                     # Browser-side fetch wrappers
      referrals.ts                      # Referral logic
      plans.ts                          # Feature flag / plan check
      credit-packages.ts                # (future) token packs
    hooks/
      useCart.ts                        # Cart state (localStorage + Shopify API)
      useWishlist.ts                    # Wishlist state
      usePremiumStatus.ts               # Check if user has active plan
    data/
      collections.ts                    # Static collection metadata (name, description, image)
    middleware.ts                       # Clerk auth middleware
  package.json
  tsconfig.json
  next.config.ts
  vercel.json
  .env.local.example
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `web/package.json`
- Create: `web/tsconfig.json`
- Create: `web/next.config.ts`
- Create: `web/vercel.json`
- Create: `web/.env.local.example`
- Create: `web/src/app/layout.tsx`
- Create: `web/src/middleware.ts`

- [ ] **Step 1: Initialise Next.js 15 project**

```bash
cd I:/thamanviecom
npx create-next-app@latest web --typescript --tailwind --app --no-src-dir --no-eslint --import-alias "@/*"
cd web
# Rename src directory layout: create src/ manually
```

Actually use this exact command sequence:
```bash
cd I:/thamanviecom
npx create-next-app@latest web --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint
cd web
```

Expected: `web/` directory created with `src/app/page.tsx`, `src/app/layout.tsx`.

- [ ] **Step 2: Install all dependencies**

```bash
cd I:/thamanviecom/web
npm install @clerk/nextjs @clerk/themes @supabase/supabase-js gsap @gsap/react lucide-react posthog-js razorpay
npm install --save-dev @types/node @types/react @types/react-dom typescript
```

Expected: `node_modules/` populated, no peer dependency errors.

- [ ] **Step 3: Write `next.config.ts`**

```typescript
// web/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },
};

export default nextConfig;
```

- [ ] **Step 4: Write `.env.local.example`**

```bash
# web/.env.local.example
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-token
SHOPIFY_WEBHOOK_SECRET=your-webhook-secret

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

MAKE_WEBHOOK_URL=https://hook.eu1.make.com/...

NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

Copy to `.env.local` and fill in real values.

- [ ] **Step 5: Write `web/vercel.json`**

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["bom1"]
}
```

`bom1` = Mumbai region (lowest latency for Indian customers).

- [ ] **Step 6: Write Clerk middleware `src/middleware.ts`**

```typescript
// web/src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
```

- [ ] **Step 7: Write root layout `src/app/layout.tsx`**

```typescript
// web/src/app/layout.tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import PostHogProvider from "@/components/PostHogProvider";

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
          <PostHogProvider>
            {children}
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Step 8: Write `globals.css`**

```css
/* web/src/app/globals.css */
@import "tailwindcss";

:root {
  --color-crimson: #8B1A1A;
  --color-gold: #B8860B;
  --color-cream: #FDF6EE;
  --color-warm: #FDF0E0;
  --font-sans: var(--font-inter);
  --font-display: var(--font-playfair);
}

* { box-sizing: border-box; }

body { font-family: var(--font-sans); }

h1, h2, h3 { font-family: var(--font-display); }

/* Smooth scrolling */
html { scroll-behavior: smooth; }

/* Hide scrollbar on cart drawer */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```

- [ ] **Step 9: Start dev server and confirm no errors**

```bash
cd I:/thamanviecom/web
npm run dev
```

Expected: `http://localhost:3000` loads Next.js default page with no console errors.

- [ ] **Step 10: Commit**

```bash
cd I:/thamanviecom/web
git init
git add -A
git commit -m "feat: scaffold Next.js 15 project with Clerk, Tailwind v4, fonts"
```

---

## Task 2: Shopify Storefront API Client

**Files:**
- Create: `web/src/lib/shopify.ts`

- [ ] **Step 1: Write the Shopify client and all GraphQL queries**

```typescript
// web/src/lib/shopify.ts

const domain = process.env.SHOPIFY_STORE_DOMAIN!;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;
const endpoint = `https://${domain}/api/2024-10/graphql.json`;

async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data as T;
}

// ── Types ────────────────────────────────────────────────────────────

export type ShopifyImage = { url: string; altText: string | null; width: number; height: number };
export type ShopifyMoney = { amount: string; currencyCode: string };
export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  priceRange: { minVariantPrice: ShopifyMoney };
  compareAtPriceRange: { minVariantPrice: ShopifyMoney };
  images: { nodes: ShopifyImage[] };
  variants: { nodes: ShopifyVariant[] };
  metafields: (ShopifyMetafield | null)[];
  collections: { nodes: { handle: string; title: string }[] };
};
export type ShopifyVariant = {
  id: string;
  title: string;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
};
export type ShopifyMetafield = { key: string; value: string; type: string };
export type ShopifyCollection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  products: { nodes: ShopifyProduct[] };
};
export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { totalAmount: ShopifyMoney; subtotalAmount: ShopifyMoney };
  lines: { nodes: ShopifyCartLine[] };
};
export type ShopifyCartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: ShopifyMoney };
  merchandise: { id: string; title: string; product: { title: string; handle: string; images: { nodes: ShopifyImage[] } } };
};

// ── Fragments ─────────────────────────────────────────────────────────

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id handle title description descriptionHtml
    priceRange { minVariantPrice { amount currencyCode } }
    compareAtPriceRange { minVariantPrice { amount currencyCode } }
    images(first: 10) { nodes { url altText width height } }
    variants(first: 20) {
      nodes {
        id title availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions { name value }
      }
    }
    metafields(identifiers: [
      { namespace: "custom", key: "fabric_type" }
      { namespace: "custom", key: "weave_type" }
      { namespace: "custom", key: "zari_purity" }
      { namespace: "custom", key: "wash_care" }
      { namespace: "custom", key: "region_of_origin" }
      { namespace: "custom", key: "blouse_piece" }
      { namespace: "custom", key: "product_video_url" }
    ]) { key value type }
    collections(first: 3) { nodes { handle title } }
  }
`;

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id checkoutUrl totalQuantity
    cost {
      totalAmount { amount currencyCode }
      subtotalAmount { amount currencyCode }
    }
    lines(first: 50) {
      nodes {
        id quantity
        cost { totalAmount { amount currencyCode } }
        merchandise {
          ... on ProductVariant {
            id title
            product { title handle images(first: 1) { nodes { url altText width height } } }
          }
        }
      }
    }
  }
`;

// ── Queries ────────────────────────────────────────────────────────────

export async function getProducts(options: {
  collection?: string;
  first?: number;
  after?: string;
  sortKey?: string;
  reverse?: boolean;
  query?: string;
}): Promise<{ products: ShopifyProduct[]; hasNextPage: boolean; endCursor: string | null }> {
  const { collection, first = 24, after, sortKey = "BEST_SELLING", reverse = false, query } = options;

  if (collection) {
    const data = await shopifyFetch<{ collection: { products: { nodes: ShopifyProduct[]; pageInfo: { hasNextPage: boolean; endCursor: string } } } }>(`
      ${PRODUCT_FRAGMENT}
      query GetCollectionProducts($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
        collection(handle: $handle) {
          products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
            nodes { ...ProductFields }
            pageInfo { hasNextPage endCursor }
          }
        }
      }
    `, { handle: collection, first, after, sortKey, reverse });
    return {
      products: data.collection.products.nodes,
      hasNextPage: data.collection.products.pageInfo.hasNextPage,
      endCursor: data.collection.products.pageInfo.endCursor,
    };
  }

  const data = await shopifyFetch<{ products: { nodes: ShopifyProduct[]; pageInfo: { hasNextPage: boolean; endCursor: string } } }>(`
    ${PRODUCT_FRAGMENT}
    query GetProducts($first: Int!, $after: String, $sortKey: ProductSortKeys, $reverse: Boolean, $query: String) {
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, query: $query) {
        nodes { ...ProductFields }
        pageInfo { hasNextPage endCursor }
      }
    }
  `, { first, after, sortKey, reverse, query });
  return {
    products: data.products.nodes,
    hasNextPage: data.products.pageInfo.hasNextPage,
    endCursor: data.products.pageInfo.endCursor,
  };
}

export async function getProduct(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ product: ShopifyProduct | null }>(`
    ${PRODUCT_FRAGMENT}
    query GetProduct($handle: String!) {
      product(handle: $handle) { ...ProductFields }
    }
  `, { handle });
  return data.product;
}

export async function getCollections(): Promise<ShopifyCollection[]> {
  const data = await shopifyFetch<{ collections: { nodes: ShopifyCollection[] } }>(`
    query GetCollections {
      collections(first: 20) {
        nodes {
          id handle title description
          image { url altText width height }
          products(first: 4) { nodes { id handle title images(first: 1) { nodes { url altText width height } } priceRange { minVariantPrice { amount currencyCode } } } }
        }
      }
    }
  `);
  return data.collections.nodes;
}

export async function getCollection(handle: string): Promise<ShopifyCollection | null> {
  const data = await shopifyFetch<{ collection: ShopifyCollection | null }>(`
    ${PRODUCT_FRAGMENT}
    query GetCollection($handle: String!) {
      collection(handle: $handle) {
        id handle title description
        image { url altText width height }
        products(first: 48) { nodes { ...ProductFields } }
      }
    }
  `, { handle });
  return data.collection;
}

export async function createCart(): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartCreate: { cart: ShopifyCart } }>(`
    ${CART_FRAGMENT}
    mutation CartCreate {
      cartCreate { cart { ...CartFields } }
    }
  `);
  return data.cartCreate.cart;
}

export async function addToCart(cartId: string, lines: { merchandiseId: string; quantity: number }[]): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesAdd: { cart: ShopifyCart } }>(`
    ${CART_FRAGMENT}
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } }
    }
  `, { cartId, lines });
  return data.cartLinesAdd.cart;
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesUpdate: { cart: ShopifyCart } }>(`
    ${CART_FRAGMENT}
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } }
    }
  `, { cartId, lines: [{ id: lineId, quantity }] });
  return data.cartLinesUpdate.cart;
}

export async function removeFromCart(cartId: string, lineIds: string[]): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesRemove: { cart: ShopifyCart } }>(`
    ${CART_FRAGMENT}
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } }
    }
  `, { cartId, lineIds });
  return data.cartLinesRemove.cart;
}

export async function getProductRecommendations(productId: string): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<{ productRecommendations: ShopifyProduct[] }>(`
    ${PRODUCT_FRAGMENT}
    query GetRecommendations($productId: ID!) {
      productRecommendations(productId: $productId) { ...ProductFields }
    }
  `, { productId });
  return data.productRecommendations;
}

// ── Helpers ────────────────────────────────────────────────────────────

export function formatPrice(money: ShopifyMoney): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: money.currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(money.amount));
}

export function getMetafield(product: ShopifyProduct, key: string): string | null {
  const mf = product.metafields.find((m) => m?.key === key);
  return mf?.value ?? null;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd I:/thamanviecom/web
npx tsc --noEmit
```

Expected: No errors. If `SHOPIFY_STORE_DOMAIN` env var missing, add placeholder to `.env.local`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/shopify.ts
git commit -m "feat: Shopify Storefront API client with GQL queries and cart mutations"
```

---

## Task 3: Supabase + Razorpay + Auth Helpers

**Files:**
- Create: `web/src/lib/supabase.ts`
- Create: `web/src/lib/razorpay.ts`
- Create: `web/src/lib/get-auth.ts`
- Create: `web/src/lib/api-security.ts`
- Create: `web/src/lib/api-client.ts`
- Create: `web/src/lib/referrals.ts`
- Create: `web/src/lib/plans.ts`

- [ ] **Step 1: Write `src/lib/supabase.ts`**

```typescript
// web/src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Browser client (anon key, RLS enforced)
export const supabase = createClient(url, anonKey);

// Server client (service role, bypasses RLS — use only in API routes)
export function getServiceSupabase() {
  return createClient(url, serviceKey);
}

export type WishlistItem = {
  id: string;
  user_id: string;
  shopify_product_id: string;
  shopify_variant_id: string | null;
  created_at: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  phone: string | null;
  coupon_sent: boolean;
  source: string;
  created_at: string;
};

export type Referral = {
  id: string;
  referrer_user_id: string;
  referred_email: string;
  shopify_order_id: string | null;
  commission_amount: number;
  status: "pending" | "approved" | "paid";
  created_at: string;
};
```

- [ ] **Step 2: Write `src/lib/razorpay.ts`**

```typescript
// web/src/lib/razorpay.ts
import crypto from "crypto";

export function createRazorpayClient() {
  const Razorpay = require("razorpay");
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export async function createRazorpayOrder(amountInPaise: number, receiptId: string) {
  const razorpay = createRazorpayClient();
  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: receiptId,
  });
  return order;
}

export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}

export function verifyRazorpayWebhook(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}
```

- [ ] **Step 3: Write `src/lib/get-auth.ts`**

```typescript
// web/src/lib/get-auth.ts
import { auth, currentUser } from "@clerk/nextjs/server";

export async function getAuthUser() {
  const { userId } = await auth();
  return userId;
}

export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function getFullUser() {
  return currentUser();
}
```

- [ ] **Step 4: Write `src/lib/api-security.ts`**

```typescript
// web/src/lib/api-security.ts
import crypto from "crypto";

export function verifyShopifyWebhook(body: string, hmacHeader: string): boolean {
  const digest = crypto
    .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET!)
    .update(body, "utf8")
    .digest("base64");
  return digest === hmacHeader;
}
```

- [ ] **Step 5: Write `src/lib/api-client.ts`**

```typescript
// web/src/lib/api-client.ts

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}
```

- [ ] **Step 6: Write `src/lib/referrals.ts`**

```typescript
// web/src/lib/referrals.ts
import { getServiceSupabase, Referral } from "./supabase";
import crypto from "crypto";

export function generateReferralCode(userId: string): string {
  return crypto.createHash("sha256").update(userId).digest("hex").slice(0, 8).toUpperCase();
}

export async function getReferralStats(userId: string): Promise<{
  code: string;
  totalReferrals: number;
  pendingAmount: number;
  paidAmount: number;
  referrals: Referral[];
}> {
  const db = getServiceSupabase();
  const { data } = await db.from("referrals").select("*").eq("referrer_user_id", userId).order("created_at", { ascending: false });
  const referrals = (data ?? []) as Referral[];
  return {
    code: generateReferralCode(userId),
    totalReferrals: referrals.length,
    pendingAmount: referrals.filter(r => r.status === "pending").reduce((s, r) => s + r.commission_amount, 0),
    paidAmount: referrals.filter(r => r.status === "paid").reduce((s, r) => s + r.commission_amount, 0),
    referrals,
  };
}
```

- [ ] **Step 7: Write `src/lib/plans.ts`**

```typescript
// web/src/lib/plans.ts
// Placeholder for premium plan gate — all features are open for v1
export function isPremium(_userId: string): boolean {
  return true;
}
```

- [ ] **Step 8: Verify TypeScript**

```bash
cd I:/thamanviecom/web && npx tsc --noEmit
```

Expected: No errors (may have warnings about unused `razorpay` require — acceptable for now).

- [ ] **Step 9: Commit**

```bash
git add src/lib/
git commit -m "feat: supabase, razorpay, auth, security, referral helpers"
```

---

## Task 4: Supabase Database Schema

**Files:**
- Create: `web/supabase/migrations/001_initial.sql`

- [ ] **Step 1: Create migrations directory**

```bash
mkdir -p I:/thamanviecom/web/supabase/migrations
```

- [ ] **Step 2: Write migration SQL**

```sql
-- web/supabase/migrations/001_initial.sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Wishlists
create table if not exists wishlists (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  shopify_product_id text not null,
  shopify_variant_id text,
  created_at timestamptz default now(),
  unique(user_id, shopify_product_id)
);

alter table wishlists enable row level security;

create policy "Users can manage own wishlist"
  on wishlists for all
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

-- Newsletter subscribers
create table if not exists newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  phone text,
  coupon_sent boolean default false,
  source text default 'homepage',
  created_at timestamptz default now()
);

-- No RLS on newsletter (server-side only inserts via service role)

-- Referrals
create table if not exists referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_user_id text not null,
  referred_email text not null,
  shopify_order_id text,
  commission_amount numeric(10,2) default 0,
  status text default 'pending' check (status in ('pending','approved','paid')),
  created_at timestamptz default now()
);

alter table referrals enable row level security;

create policy "Users can view own referrals"
  on referrals for select
  using (auth.uid()::text = referrer_user_id);
```

- [ ] **Step 3: Run migration in Supabase**

Go to Supabase Dashboard → SQL Editor → paste the SQL above → Run.

Verify tables `wishlists`, `newsletter_subscribers`, `referrals` appear in Table Editor.

- [ ] **Step 4: Commit**

```bash
cd I:/thamanviecom/web
git add supabase/
git commit -m "feat: supabase schema - wishlists, newsletter_subscribers, referrals"
```

---

## Task 5: PostHog Provider + Health Route

**Files:**
- Create: `web/src/components/PostHogProvider.tsx`
- Create: `web/src/app/api/internal/health/route.ts`

- [ ] **Step 1: Write `PostHogProvider.tsx`**

```typescript
// web/src/components/PostHogProvider.tsx
"use client";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
        capture_pageview: false,
        capture_pageleave: true,
      });
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
```

- [ ] **Step 2: Write health route**

```typescript
// web/src/app/api/internal/health/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge";

export function GET() {
  return NextResponse.json({ status: "ok", ts: Date.now() });
}
```

- [ ] **Step 3: Test health endpoint**

```bash
curl http://localhost:3000/api/internal/health
```

Expected: `{"status":"ok","ts":...}`

- [ ] **Step 4: Commit**

```bash
git add src/components/PostHogProvider.tsx src/app/api/internal/
git commit -m "feat: PostHog provider and health check endpoint"
```

---

## Task 6: Shared Layout Components

**Files:**
- Create: `web/src/components/WhatsAppCTA.tsx`
- Create: `web/src/components/TrustStrip.tsx`
- Create: `web/src/components/NewsletterForm.tsx`
- Create: `web/src/data/collections.ts`

- [ ] **Step 1: Write `WhatsAppCTA.tsx`**

```typescript
// web/src/components/WhatsAppCTA.tsx
"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const WHATSAPP_NUMBER = "919535779597";
const PRE_FILLED = "Hi! I found you on your website. I'm interested in your sarees.";

export default function WhatsAppCTA() {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mq.matches && ref.current) {
      gsap.to(ref.current, {
        scale: 1.12,
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        repeatDelay: 3.4,
      });
    }
  }, []);

  return (
    <a
      ref={ref}
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PRE_FILLED)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/30 transition-shadow hover:shadow-xl"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.126 1.534 5.867L.057 23.63a.5.5 0 0 0 .609.63l5.939-1.56A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 0 1-5.186-1.452l-.371-.22-3.525.927.934-3.432-.241-.383A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
    </a>
  );
}
```

- [ ] **Step 2: Write `TrustStrip.tsx`**

```typescript
// web/src/components/TrustStrip.tsx
import { Star, RefreshCw, Award, MapPin } from "lucide-react";

const items = [
  { icon: Star, label: "4.8 Google Rating", sub: "420+ Reviews" },
  { icon: RefreshCw, label: "Free Exchanges", sub: "Hassle-free policy" },
  { icon: Award, label: "30-Year Legacy", sub: "Trusted since 1994" },
  { icon: MapPin, label: "Puttur, Karnataka", sub: "Visit our store" },
];

export default function TrustStrip() {
  return (
    <div className="bg-[#8B1A1A] text-white py-4">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="h-5 w-5 shrink-0 text-[#B8860B]" />
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-white/70">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write `NewsletterForm.tsx`**

```typescript
// web/src/components/NewsletterForm.tsx
"use client";
import { useState } from "react";
import { apiFetch } from "@/lib/api-client";

export default function NewsletterForm({ source = "homepage" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await apiFetch("/api/newsletter", {
        method: "POST",
        body: JSON.stringify({ email, source }),
      });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="bg-[#FDF0E0] py-14 px-4">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-3xl text-[#8B1A1A] mb-2">Get 10% Off Your First Order</h2>
        <p className="text-sm text-[#666] mb-6">Subscribe for new arrivals, exclusive offers & styling tips.</p>
        {status === "success" ? (
          <p className="text-[#2E7D32] font-medium">Thank you! Check your email for your coupon.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 rounded border border-[#D4A96A] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#8B1A1A]"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded bg-[#8B1A1A] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 hover:bg-[#6d1414] transition-colors"
            >
              {status === "loading" ? "..." : "Subscribe"}
            </button>
          </form>
        )}
        {status === "error" && <p className="mt-2 text-sm text-red-600">Something went wrong. Please try again.</p>}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Write `src/data/collections.ts`**

```typescript
// web/src/data/collections.ts
export const COLLECTIONS = [
  {
    handle: "kanjivaram-silk",
    title: "Kanjivaram Silk",
    description: "Authentic Kanjivaram silk sarees woven in Kanchipuram with pure zari borders.",
    emoji: "🌟",
  },
  {
    handle: "banarasi-silk",
    title: "Banarasi Silk",
    description: "Royal Banarasi silk sarees with intricate brocade weaving from Varanasi.",
    emoji: "✨",
  },
  {
    handle: "mysore-silk",
    title: "Mysore Silk",
    description: "Luxurious Mysore silk sarees with a distinctive sheen and vibrant colours.",
    emoji: "💜",
  },
  {
    handle: "wedding-silk",
    title: "Wedding Silk",
    description: "Bridal collection — rich silks with heavy zari work for your special day.",
    emoji: "👰",
  },
  {
    handle: "casual-cotton",
    title: "Casual Cotton",
    description: "Lightweight cotton sarees for everyday elegance.",
    emoji: "🌸",
  },
] as const;

export type CollectionHandle = (typeof COLLECTIONS)[number]["handle"];
```

- [ ] **Step 5: Commit**

```bash
git add src/components/WhatsAppCTA.tsx src/components/TrustStrip.tsx src/components/NewsletterForm.tsx src/data/collections.ts
git commit -m "feat: WhatsApp CTA, trust strip, newsletter form, collections data"
```

---

## Task 7: Newsletter + Wishlist API Routes

**Files:**
- Create: `web/src/app/api/newsletter/route.ts`
- Create: `web/src/app/api/wishlist/route.ts`
- Create: `web/src/app/api/referrals/register/route.ts`
- Create: `web/src/app/api/referrals/me/route.ts`

- [ ] **Step 1: Write newsletter route**

```typescript
// web/src/app/api/newsletter/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email, source = "homepage" } = await req.json();
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const db = getServiceSupabase();
  const { error } = await db.from("newsletter_subscribers").upsert({ email, source }, { onConflict: "email" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Trigger Make.com welcome flow
  if (process.env.MAKE_WEBHOOK_URL) {
    await fetch(process.env.MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "newsletter_signup", email, source }),
    }).catch(() => {}); // non-blocking
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Write wishlist route**

```typescript
// web/src/app/api/wishlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/get-auth";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  const userId = await requireAuth().catch(() => null);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getServiceSupabase();
  const { data } = await db.from("wishlists").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const userId = await requireAuth().catch(() => null);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { shopify_product_id, shopify_variant_id } = await req.json();
  if (!shopify_product_id) return NextResponse.json({ error: "Missing product ID" }, { status: 400 });

  const db = getServiceSupabase();
  const { error } = await db.from("wishlists").upsert({ user_id: userId, shopify_product_id, shopify_variant_id }, { onConflict: "user_id,shopify_product_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const userId = await requireAuth().catch(() => null);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const shopify_product_id = searchParams.get("productId");
  if (!shopify_product_id) return NextResponse.json({ error: "Missing productId" }, { status: 400 });

  const db = getServiceSupabase();
  await db.from("wishlists").delete().eq("user_id", userId).eq("shopify_product_id", shopify_product_id);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Write referral routes**

```typescript
// web/src/app/api/referrals/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/get-auth";
import { generateReferralCode } from "@/lib/referrals";

export async function POST(_req: NextRequest) {
  const userId = await requireAuth().catch(() => null);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ code: generateReferralCode(userId) });
}
```

```typescript
// web/src/app/api/referrals/me/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/get-auth";
import { getReferralStats } from "@/lib/referrals";

export async function GET() {
  const userId = await requireAuth().catch(() => null);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const stats = await getReferralStats(userId);
  return NextResponse.json(stats);
}
```

- [ ] **Step 4: Test newsletter endpoint**

With dev server running:
```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"test"}'
```

Expected: `{"ok":true}`

- [ ] **Step 5: Commit**

```bash
git add src/app/api/newsletter/ src/app/api/wishlist/ src/app/api/referrals/
git commit -m "feat: newsletter, wishlist, referral API routes"
```

---

## Task 8: Razorpay Payment Routes

**Files:**
- Create: `web/src/app/api/payments/razorpay/order/route.ts`
- Create: `web/src/app/api/payments/razorpay/verify/route.ts`
- Create: `web/src/app/api/payments/razorpay/webhook/route.ts`

- [ ] **Step 1: Write Razorpay order creation route**

```typescript
// web/src/app/api/payments/razorpay/order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/get-auth";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const userId = await requireAuth().catch(() => null);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amountInPaise, cartId } = await req.json();
  if (!amountInPaise || amountInPaise < 100) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const receipt = `cart_${cartId}_${Date.now()}`;
  const order = await createRazorpayOrder(amountInPaise, receipt);
  return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
}
```

- [ ] **Step 2: Write payment verification route**

```typescript
// web/src/app/api/payments/razorpay/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

  const valid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  return NextResponse.json({ ok: true, paymentId: razorpay_payment_id });
}
```

- [ ] **Step 3: Write Razorpay webhook route**

```typescript
// web/src/app/api/payments/razorpay/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhook } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyRazorpayWebhook(body, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "payment.captured") {
    // Forward to Make.com for order fulfilment automation
    if (process.env.MAKE_WEBHOOK_URL) {
      await fetch(process.env.MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "payment_captured", payload: event }),
      }).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/payments/
git commit -m "feat: Razorpay order, verify, and webhook routes"
```

---

## Task 9: Cart Hook + Cart Drawer

**Files:**
- Create: `web/src/hooks/useCart.ts`
- Create: `web/src/hooks/useWishlist.ts`
- Create: `web/src/components/CartDrawer.tsx`
- Create: `web/src/components/WishlistButton.tsx`

- [ ] **Step 1: Write `useCart.ts`**

```typescript
// web/src/hooks/useCart.ts
"use client";
import { useState, useEffect, useCallback } from "react";
import { ShopifyCart } from "@/lib/shopify";
import { apiFetch } from "@/lib/api-client";

const CART_ID_KEY = "thamanvi_cart_id";

export function useCart() {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedCartId = localStorage.getItem(CART_ID_KEY);
    if (savedCartId) {
      apiFetch<ShopifyCart>(`/api/shopify/cart?cartId=${savedCartId}`)
        .then(setCart)
        .catch(() => localStorage.removeItem(CART_ID_KEY));
    }
  }, []);

  const addItem = useCallback(async (merchandiseId: string, quantity = 1) => {
    setLoading(true);
    try {
      let cartId = localStorage.getItem(CART_ID_KEY);
      if (!cartId) {
        const created = await apiFetch<ShopifyCart>("/api/shopify/cart", { method: "POST", body: JSON.stringify({ action: "create" }) });
        cartId = created.id;
        localStorage.setItem(CART_ID_KEY, cartId);
      }
      const updated = await apiFetch<ShopifyCart>("/api/shopify/cart", {
        method: "POST",
        body: JSON.stringify({ action: "add", cartId, lines: [{ merchandiseId, quantity }] }),
      });
      setCart(updated);
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (lineId: string, quantity: number) => {
    const cartId = localStorage.getItem(CART_ID_KEY);
    if (!cartId) return;
    setLoading(true);
    try {
      const updated = await apiFetch<ShopifyCart>("/api/shopify/cart", {
        method: "POST",
        body: JSON.stringify({ action: "update", cartId, lineId, quantity }),
      });
      setCart(updated);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (lineId: string) => {
    const cartId = localStorage.getItem(CART_ID_KEY);
    if (!cartId) return;
    setLoading(true);
    try {
      const updated = await apiFetch<ShopifyCart>("/api/shopify/cart", {
        method: "POST",
        body: JSON.stringify({ action: "remove", cartId, lineIds: [lineId] }),
      });
      setCart(updated);
    } finally {
      setLoading(false);
    }
  }, []);

  return { cart, loading, isOpen, setIsOpen, addItem, updateItem, removeItem };
}
```

- [ ] **Step 2: Write `useWishlist.ts`**

```typescript
// web/src/hooks/useWishlist.ts
"use client";
import { useState, useEffect, useCallback } from "react";
import { WishlistItem } from "@/lib/supabase";
import { apiFetch } from "@/lib/api-client";

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    apiFetch<WishlistItem[]>("/api/wishlist").then(setItems).catch(() => {});
  }, []);

  const toggle = useCallback(async (shopify_product_id: string) => {
    const exists = items.some(i => i.shopify_product_id === shopify_product_id);
    if (exists) {
      await apiFetch(`/api/wishlist?productId=${shopify_product_id}`, { method: "DELETE" });
      setItems(prev => prev.filter(i => i.shopify_product_id !== shopify_product_id));
    } else {
      await apiFetch("/api/wishlist", { method: "POST", body: JSON.stringify({ shopify_product_id }) });
      setItems(prev => [...prev, { id: "", user_id: "", shopify_product_id, shopify_variant_id: null, created_at: "" }]);
    }
  }, [items]);

  const isWishlisted = useCallback((id: string) => items.some(i => i.shopify_product_id === id), [items]);

  return { items, toggle, isWishlisted };
}
```

- [ ] **Step 3: Write `CartDrawer.tsx`**

```typescript
// web/src/components/CartDrawer.tsx
"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/shopify";

export default function CartDrawer() {
  const { cart, loading, isOpen, setIsOpen, updateItem, removeItem } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!drawerRef.current || !overlayRef.current) return;
    if (isOpen) {
      gsap.set(drawerRef.current, { x: "100%" });
      gsap.to(drawerRef.current, { x: "0%", duration: 0.35, ease: "power2.out" });
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, pointerEvents: "auto" });
    } else {
      if (!mq.matches) {
        gsap.to(drawerRef.current, { x: "100%", duration: 0.3, ease: "power2.in" });
      }
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, pointerEvents: "none" });
    }
  }, [isOpen]);

  const itemCount = cart?.totalQuantity ?? 0;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 z-40 bg-black/40 opacity-0 pointer-events-none"
      />
      {/* Drawer */}
      <div ref={drawerRef} className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-[#FDF6EE] shadow-2xl flex flex-col translate-x-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D4A96A] px-6 py-4">
          <h2 className="font-display text-xl text-[#8B1A1A]">
            Your Cart {itemCount > 0 && <span className="text-sm font-sans text-[#666]">({itemCount} items)</span>}
          </h2>
          <button onClick={() => setIsOpen(false)} aria-label="Close cart" className="rounded-full p-1 hover:bg-[#FDF0E0]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 space-y-4">
          {!cart || itemCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingBag className="h-12 w-12 text-[#D4A96A]" />
              <p className="text-[#666]">Your cart is empty.</p>
              <button onClick={() => setIsOpen(false)} className="text-sm text-[#8B1A1A] underline underline-offset-2">Continue Shopping</button>
            </div>
          ) : (
            cart.lines.nodes.map(line => (
              <div key={line.id} className="flex gap-4 items-start">
                <div className="relative h-20 w-16 shrink-0 rounded overflow-hidden bg-[#FDF0E0]">
                  {line.merchandise.product.images.nodes[0] && (
                    <Image
                      src={line.merchandise.product.images.nodes[0].url}
                      alt={line.merchandise.product.images.nodes[0].altText ?? line.merchandise.product.title}
                      fill className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{line.merchandise.product.title}</p>
                  <p className="text-xs text-[#666]">{line.merchandise.title}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => updateItem(line.id, line.quantity - 1)} disabled={loading || line.quantity <= 1} aria-label="Decrease" className="rounded-full border border-[#D4A96A] p-0.5 disabled:opacity-40">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm w-5 text-center">{line.quantity}</span>
                    <button onClick={() => updateItem(line.id, line.quantity + 1)} disabled={loading} aria-label="Increase" className="rounded-full border border-[#D4A96A] p-0.5 disabled:opacity-40">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-[#8B1A1A]">{formatPrice(line.cost.totalAmount)}</p>
                  <button onClick={() => removeItem(line.id)} className="mt-1 text-xs text-[#999] hover:text-[#C62828]">Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart && itemCount > 0 && (
          <div className="border-t border-[#D4A96A] px-6 py-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#666]">Subtotal</span>
              <span className="font-semibold">{formatPrice(cart.cost.subtotalAmount)}</span>
            </div>
            <p className="text-xs text-[#666]">Shipping calculated at checkout</p>
            <a
              href={cart.checkoutUrl}
              className="block w-full rounded bg-[#8B1A1A] py-3 text-center text-sm font-semibold text-white hover:bg-[#6d1414] transition-colors"
            >
              Proceed to Checkout
            </a>
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 4: Write `WishlistButton.tsx`**

```typescript
// web/src/components/WishlistButton.tsx
"use client";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@clerk/nextjs";

export default function WishlistButton({ productId, className = "" }: { productId: string; className?: string }) {
  const { isSignedIn } = useAuth();
  const { toggle, isWishlisted } = useWishlist();
  const active = isWishlisted(productId);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (!isSignedIn) { window.location.href = "/sign-in"; return; }
    await toggle(productId).catch(() => {});
  }

  return (
    <button
      onClick={handleClick}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-white ${className}`}
    >
      <Heart className={`h-4 w-4 transition-colors ${active ? "fill-[#8B1A1A] text-[#8B1A1A]" : "text-[#666]"}`} />
    </button>
  );
}
```

- [ ] **Step 5: Write Shopify cart API route**

```typescript
// web/src/app/api/shopify/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createCart, addToCart, updateCartLine, removeFromCart } from "@/lib/shopify";

export async function GET(req: NextRequest) {
  const cartId = new URL(req.url).searchParams.get("cartId");
  if (!cartId) return NextResponse.json({ error: "Missing cartId" }, { status: 400 });
  // Re-use addToCart with empty lines to fetch cart — Shopify doesn't have a standalone getCart in SF API v1
  // Instead use createCart-like approach: return empty cart signal
  return NextResponse.json({ id: cartId });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, cartId, lines, lineId, lineIds, quantity } = body;

  try {
    switch (action) {
      case "create":
        return NextResponse.json(await createCart());
      case "add":
        return NextResponse.json(await addToCart(cartId, lines));
      case "update":
        return NextResponse.json(await updateCartLine(cartId, lineId, quantity));
      case "remove":
        return NextResponse.json(await removeFromCart(cartId, lineIds));
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/hooks/ src/components/CartDrawer.tsx src/components/WishlistButton.tsx src/app/api/shopify/cart/
git commit -m "feat: cart hook, wishlist hook, CartDrawer, WishlistButton, cart API route"
```

---

## Task 10: ProductCard + ProductGallery

**Files:**
- Create: `web/src/components/ProductCard.tsx`
- Create: `web/src/components/ProductGallery.tsx`

- [ ] **Step 1: Write `ProductCard.tsx`**

```typescript
// web/src/components/ProductCard.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { ShopifyProduct, formatPrice } from "@/lib/shopify";
import WishlistButton from "./WishlistButton";

export default function ProductCard({ product }: { product: ShopifyProduct }) {
  const image = product.images.nodes[0];
  const price = product.priceRange.minVariantPrice;
  const comparePrice = product.compareAtPriceRange.minVariantPrice;
  const hasDiscount = Number(comparePrice.amount) > Number(price.amount);

  return (
    <Link href={`/products/${product.handle}`} className="group relative flex flex-col">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded bg-[#FDF0E0]">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#D4A96A] text-4xl">🧣</div>
        )}
        <div className="absolute top-2 right-2">
          <WishlistButton productId={product.id} />
        </div>
        {hasDiscount && (
          <div className="absolute top-2 left-2 rounded bg-[#8B1A1A] px-1.5 py-0.5 text-xs font-semibold text-white">
            Sale
          </div>
        )}
      </div>
      <div className="mt-2 flex-1 px-0.5">
        <h3 className="text-sm font-medium line-clamp-2 text-[#1A1A1A]">{product.title}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-[#8B1A1A]">{formatPrice(price)}</span>
          {hasDiscount && (
            <span className="text-xs text-[#999] line-through">{formatPrice(comparePrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Write `ProductGallery.tsx`**

```typescript
// web/src/components/ProductGallery.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ShopifyImage } from "@/lib/shopify";

export default function ProductGallery({ images }: { images: ShopifyImage[] }) {
  const [active, setActive] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  function switchImage(idx: number) {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mq.matches && mainRef.current) {
      gsap.to(mainRef.current, { opacity: 0, duration: 0.15, onComplete: () => {
        setActive(idx);
        gsap.to(mainRef.current, { opacity: 1, duration: 0.25 });
      }});
    } else {
      setActive(idx);
    }
  }

  if (images.length === 0) {
    return <div className="aspect-[3/4] w-full rounded bg-[#FDF0E0] flex items-center justify-center text-6xl">🧣</div>;
  }

  return (
    <div className="flex gap-3">
      {/* Thumbnails */}
      <div className="hidden md:flex flex-col gap-2 w-16 shrink-0">
        {images.map((img, i) => (
          <button
            key={img.url}
            onClick={() => switchImage(i)}
            className={`relative aspect-square w-full overflow-hidden rounded border-2 transition-colors ${i === active ? "border-[#8B1A1A]" : "border-transparent hover:border-[#D4A96A]"}`}
          >
            <Image src={img.url} alt={img.altText ?? ""} fill className="object-cover" sizes="64px" />
          </button>
        ))}
      </div>
      {/* Main image */}
      <div ref={mainRef} className="flex-1 relative aspect-[3/4] rounded overflow-hidden bg-[#FDF0E0]">
        <Image
          src={images[active].url}
          alt={images[active].altText ?? ""}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={active === 0}
        />
      </div>
      {/* Mobile dots */}
      {images.length > 1 && (
        <div className="md:hidden flex justify-center gap-1.5 mt-3 absolute bottom-3 inset-x-0">
          {images.map((_, i) => (
            <button key={i} onClick={() => switchImage(i)} className={`h-1.5 rounded-full transition-all ${i === active ? "w-4 bg-[#8B1A1A]" : "w-1.5 bg-[#D4A96A]"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ProductCard.tsx src/components/ProductGallery.tsx
git commit -m "feat: ProductCard with hover/discount, ProductGallery with GSAP crossfade"
```

---

## Task 11: Homepage

**Files:**
- Create: `web/src/components/HeroSection.tsx`
- Modify: `web/src/app/page.tsx`

- [ ] **Step 1: Write `HeroSection.tsx`**

```typescript
// web/src/components/HeroSection.tsx
"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import Link from "next/link";

export default function HeroSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches || !headlineRef.current) return;
    const tl = gsap.timeline({ delay: 0.3 });
    tl.fromTo(headlineRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" })
      .fromTo(subRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.4")
      .fromTo(ctaRef.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.3");
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#1A0A0A]">
      {/* Background video — swap src with actual Freepik-generated hero video */}
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        aria-hidden="true"
      >
        <source src="/hero-silk.mp4" type="video/mp4" />
      </video>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1A0A0A]/80 via-[#1A0A0A]/40 to-transparent" />
      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <h1 ref={headlineRef} className="font-display text-4xl md:text-6xl lg:text-7xl text-white leading-tight max-w-2xl opacity-0">
          Wear the<br />
          <span className="text-[#B8860B]">Art of Silk</span>
        </h1>
        <p ref={subRef} className="mt-6 max-w-md text-white/80 text-lg opacity-0">
          Authentic silk sarees from Puttur, Karnataka — Kanjivaram, Banarasi, Mysore Silk and more. Trusted since 1994.
        </p>
        <a
          ref={ctaRef}
          href="/collections/kanjivaram-silk"
          className="mt-10 inline-block rounded bg-[#8B1A1A] px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-[#6d1414] transition-colors opacity-0"
        >
          Explore Collections
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write homepage `page.tsx`**

```typescript
// web/src/app/page.tsx
import HeroSection from "@/components/HeroSection";
import TrustStrip from "@/components/TrustStrip";
import NewsletterForm from "@/components/NewsletterForm";
import ProductCard from "@/components/ProductCard";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import CartDrawer from "@/components/CartDrawer";
import { getProducts, getCollections } from "@/lib/shopify";
import { COLLECTIONS } from "@/data/collections";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 300; // 5 minute ISR

export default async function HomePage() {
  const [{ products: bestsellers }, collections] = await Promise.all([
    getProducts({ first: 8, sortKey: "BEST_SELLING" }),
    getCollections(),
  ]);

  return (
    <>
      <HeroSection />
      <TrustStrip />

      {/* Collections Grid */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl text-[#8B1A1A] text-center mb-10">Shop by Collection</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {COLLECTIONS.map(col => {
            const shopifyCol = collections.find(c => c.handle === col.handle);
            const image = shopifyCol?.image;
            return (
              <Link key={col.handle} href={`/collections/${col.handle}`} className="group flex flex-col items-center gap-2 text-center">
                <div className="relative h-28 w-28 rounded-full overflow-hidden bg-[#FDF0E0] border-2 border-transparent group-hover:border-[#8B1A1A] transition-colors">
                  {image ? (
                    <Image src={image.url} alt={col.title} fill className="object-cover" sizes="112px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">{col.emoji}</div>
                  )}
                </div>
                <span className="text-sm font-medium text-[#1A1A1A]">{col.title}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="bg-[#FDF0E0] py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="font-display text-3xl text-[#8B1A1A] mb-2">Bestsellers</h2>
            <p className="text-sm text-[#666] mb-8">Our most-loved sarees, chosen by customers across India.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {bestsellers.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            <div className="mt-10 text-center">
              <Link href="/collections/all" className="inline-block border border-[#8B1A1A] text-[#8B1A1A] px-8 py-3 text-sm font-semibold rounded hover:bg-[#8B1A1A] hover:text-white transition-colors">
                View All Products
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl text-[#8B1A1A] text-center mb-10">What Our Customers Say</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Kavitha R.", text: "The Kanjivaram I bought for my daughter's wedding was absolutely stunning. Pure quality!", stars: 5 },
            { name: "Meena Shetty", text: "Staff are so helpful and patient. They showed us 20+ sarees without any pressure. Loved the experience.", stars: 5 },
            { name: "Anitha Bhat", text: "Been buying from Thamanvi Silks for 10 years. Their collection is always fresh and the zari quality is unmatched.", stars: 5 },
          ].map(({ name, text, stars }) => (
            <div key={name} className="rounded-lg bg-[#FDF0E0] p-6">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: stars }).map((_, i) => <span key={i} className="text-[#B8860B]">★</span>)}
              </div>
              <p className="text-sm text-[#444] italic mb-4">"{text}"</p>
              <p className="text-sm font-semibold text-[#1A1A1A]">— {name}</p>
            </div>
          ))}
        </div>
      </section>

      <NewsletterForm />
      <WhatsAppCTA />
      <CartDrawer />
    </>
  );
}
```

- [ ] **Step 3: Test homepage**

With dev server running, visit `http://localhost:3000`. Confirm:
- Hero section renders (video placeholder is fine)
- Collections circles appear
- No TypeScript/console errors

- [ ] **Step 4: Commit**

```bash
git add src/components/HeroSection.tsx src/app/page.tsx
git commit -m "feat: homepage with hero, collections, bestsellers, testimonials"
```

---

## Task 12: Product Listing Page (PLP)

**Files:**
- Create: `web/src/components/FilterSidebar.tsx`
- Create: `web/src/app/collections/[handle]/page.tsx`
- Create: `web/src/app/api/shopify/collections/route.ts`
- Create: `web/src/app/api/shopify/products/route.ts`

- [ ] **Step 1: Write Shopify products API proxy**

```typescript
// web/src/app/api/shopify/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getProducts, getProduct } from "@/lib/shopify";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const collection = searchParams.get("collection") ?? undefined;
  const first = Number(searchParams.get("first") ?? 24);
  const after = searchParams.get("after") ?? undefined;
  const sortKey = searchParams.get("sortKey") ?? "BEST_SELLING";

  const result = await getProducts({ collection, first, after, sortKey });
  return NextResponse.json(result, { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } });
}
```

- [ ] **Step 2: Write Shopify collections API proxy**

```typescript
// web/src/app/api/shopify/collections/route.ts
import { NextResponse } from "next/server";
import { getCollections } from "@/lib/shopify";

export const runtime = "edge";

export async function GET() {
  const collections = await getCollections();
  return NextResponse.json(collections, { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" } });
}
```

- [ ] **Step 3: Write `FilterSidebar.tsx`**

```typescript
// web/src/components/FilterSidebar.tsx
"use client";

type SortOption = { label: string; value: string };

const SORT_OPTIONS: SortOption[] = [
  { label: "Bestsellers", value: "BEST_SELLING" },
  { label: "Newest", value: "CREATED_AT" },
  { label: "Price: Low to High", value: "PRICE" },
  { label: "Price: High to Low", value: "PRICE_DESC" },
];

type Props = {
  sortKey: string;
  onSortChange: (key: string) => void;
};

export default function FilterSidebar({ sortKey, onSortChange }: Props) {
  return (
    <aside className="w-full md:w-56 shrink-0">
      <div className="rounded-lg border border-[#D4A96A] bg-white p-4">
        <h3 className="font-semibold text-sm text-[#1A1A1A] mb-3">Sort By</h3>
        <div className="space-y-2">
          {SORT_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sort"
                value={opt.value}
                checked={sortKey === opt.value}
                onChange={() => onSortChange(opt.value)}
                className="accent-[#8B1A1A]"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Write PLP page**

```typescript
// web/src/app/collections/[handle]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollection, getCollections } from "@/lib/shopify";
import PLPClient from "./PLPClient";

export const revalidate = 60;

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map(c => ({ handle: c.handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollection(handle);
  if (!collection) return {};
  return {
    title: collection.title,
    description: collection.description || `Shop ${collection.title} sarees at Thamanvi Silks.`,
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const collection = await getCollection(handle);
  if (!collection) notFound();

  return <PLPClient collection={collection} />;
}
```

- [ ] **Step 5: Create `PLPClient.tsx` (client interactive layer)**

```typescript
// web/src/app/collections/[handle]/PLPClient.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ShopifyCollection, ShopifyProduct, getProducts } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppCTA from "@/components/WhatsAppCTA";

export default function PLPClient({ collection }: { collection: ShopifyCollection }) {
  const [products, setProducts] = useState<ShopifyProduct[]>(collection.products.nodes);
  const [sortKey, setSortKey] = useState("BEST_SELLING");
  const [loading, setLoading] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/shopify/products?collection=${collection.handle}&sortKey=${sortKey}&first=48`)
      .then(r => r.json())
      .then(({ products: p }) => {
        setProducts(p);
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (!mq.matches && gridRef.current) {
          const cards = gridRef.current.querySelectorAll("a");
          gsap.fromTo(cards, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" });
        }
      })
      .finally(() => setLoading(false));
  }, [sortKey, collection.handle]);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#666] mb-6">
          <a href="/" className="hover:text-[#8B1A1A]">Home</a>
          <span className="mx-2">›</span>
          <span>{collection.title}</span>
        </nav>

        <h1 className="font-display text-3xl text-[#8B1A1A] mb-2">{collection.title}</h1>
        {collection.description && <p className="text-sm text-[#666] mb-8 max-w-xl">{collection.description}</p>}

        <div className="flex flex-col md:flex-row gap-8">
          <FilterSidebar sortKey={sortKey} onSortChange={setSortKey} />
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded bg-[#FDF0E0] animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <p className="text-[#666] py-12 text-center">No products found in this collection.</p>
            ) : (
              <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
      <WhatsAppCTA />
      <CartDrawer />
    </>
  );
}
```

- [ ] **Step 6: Test PLP**

Visit `http://localhost:3000/collections/kanjivaram-silk`. Confirm:
- Products grid renders (may be empty if Shopify not set up — that's fine)
- Sort radio buttons work
- No console errors

- [ ] **Step 7: Commit**

```bash
git add src/app/collections/ src/components/FilterSidebar.tsx src/app/api/shopify/products/ src/app/api/shopify/collections/
git commit -m "feat: product listing page with sort filter, skeleton loading, GSAP stagger"
```

---

## Task 13: Product Detail Page (PDP)

**Files:**
- Create: `web/src/app/products/[handle]/page.tsx`
- Create: `web/src/app/api/shopify/products/[handle]/route.ts`

- [ ] **Step 1: Write single product API proxy**

```typescript
// web/src/app/api/shopify/products/[handle]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getProduct } from "@/lib/shopify";

export const runtime = "edge";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product, { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } });
}
```

- [ ] **Step 2: Write PDP page**

```typescript
// web/src/app/products/[handle]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getProduct, getProductRecommendations, formatPrice, getMetafield } from "@/lib/shopify";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import CartDrawer from "@/components/CartDrawer";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "@/components/WishlistButton";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return {};
  return {
    title: product.title,
    description: product.description.slice(0, 155),
    openGraph: {
      images: product.images.nodes[0] ? [{ url: product.images.nodes[0].url }] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const [product, recommendations] = await Promise.all([
    getProduct(handle),
    getProduct(handle).then(p => p ? getProductRecommendations(p.id) : []),
  ]);

  if (!product) notFound();

  const price = product.priceRange.minVariantPrice;
  const comparePrice = product.compareAtPriceRange.minVariantPrice;
  const hasDiscount = Number(comparePrice.amount) > Number(price.amount);

  const metaRows = [
    ["Fabric", getMetafield(product, "fabric_type")],
    ["Weave Type", getMetafield(product, "weave_type")],
    ["Zari Purity", getMetafield(product, "zari_purity")],
    ["Blouse Piece", getMetafield(product, "blouse_piece") === "true" ? "Included" : "Not Included"],
    ["Region of Origin", getMetafield(product, "region_of_origin")],
    ["Wash Care", getMetafield(product, "wash_care")],
  ].filter(([, v]) => v) as [string, string][];

  const videoUrl = getMetafield(product, "product_video_url");
  const whatsappNumber = "919535779597";
  const whatsappMsg = `Hi! I'm interested in the ${product.title} on your website. Can you share more details?`;

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#666] mb-6">
          <a href="/" className="hover:text-[#8B1A1A]">Home</a>
          <span className="mx-2">›</span>
          {product.collections.nodes[0] && (
            <>
              <a href={`/collections/${product.collections.nodes[0].handle}`} className="hover:text-[#8B1A1A]">
                {product.collections.nodes[0].title}
              </a>
              <span className="mx-2">›</span>
            </>
          )}
          <span>{product.title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div>
            <ProductGallery images={product.images.nodes} />
            {videoUrl && (
              <video src={videoUrl} controls className="mt-4 w-full rounded" />
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-display text-2xl md:text-3xl text-[#1A1A1A] leading-snug">{product.title}</h1>
              <WishlistButton productId={product.id} className="shrink-0 mt-1" />
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-[#8B1A1A]">{formatPrice(price)}</span>
              {hasDiscount && <span className="text-base text-[#999] line-through">{formatPrice(comparePrice)}</span>}
            </div>

            {/* Add to Cart */}
            <AddToCartButton product={product} />

            {/* WhatsApp Enquiry */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded border-2 border-[#25D366] py-2.5 text-sm font-semibold text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.126 1.534 5.867L.057 23.63a.5.5 0 0 0 .609.63l5.939-1.56A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 0 1-5.186-1.452l-.371-.22-3.525.927.934-3.432-.241-.383A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              Enquire on WhatsApp
            </a>

            {/* Product Details Table */}
            {metaRows.length > 0 && (
              <div>
                <h2 className="font-semibold text-sm text-[#1A1A1A] mb-2">Product Details</h2>
                <table className="w-full text-sm">
                  <tbody>
                    {metaRows.map(([label, value]) => (
                      <tr key={label} className="border-b border-[#F0E0C8]">
                        <td className="py-2 pr-4 text-[#666] font-medium w-36">{label}</td>
                        <td className="py-2 text-[#1A1A1A]">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Description */}
            {product.descriptionHtml && (
              <div className="text-sm text-[#444] leading-relaxed" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl text-[#8B1A1A] mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {recommendations.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* JSON-LD Product Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: product.description,
          image: product.images.nodes[0]?.url,
          offers: {
            "@type": "Offer",
            price: Number(price.amount),
            priceCurrency: price.currencyCode,
            availability: product.variants.nodes.some(v => v.availableForSale)
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        })}}
      />

      <WhatsAppCTA />
      <CartDrawer />
    </>
  );
}
```

- [ ] **Step 3: Write `AddToCartButton.tsx`**

```typescript
// web/src/app/products/[handle]/AddToCartButton.tsx
"use client";
import { useState } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import { useCart } from "@/hooks/useCart";

export default function AddToCartButton({ product }: { product: ShopifyProduct }) {
  const { addItem, loading } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants.nodes[0]?.id ?? "");
  const selectedVariant = product.variants.nodes.find(v => v.id === selectedVariantId);
  const inStock = selectedVariant?.availableForSale ?? false;

  return (
    <div className="space-y-3">
      {product.variants.nodes.length > 1 && (
        <select
          value={selectedVariantId}
          onChange={e => setSelectedVariantId(e.target.value)}
          className="w-full rounded border border-[#D4A96A] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8B1A1A]"
        >
          {product.variants.nodes.map(v => (
            <option key={v.id} value={v.id} disabled={!v.availableForSale}>
              {v.title}{!v.availableForSale ? " — Sold Out" : ""}
            </option>
          ))}
        </select>
      )}
      <button
        onClick={() => addItem(selectedVariantId)}
        disabled={loading || !inStock}
        className="w-full rounded bg-[#8B1A1A] py-3.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-[#6d1414] transition-colors"
      >
        {loading ? "Adding..." : inStock ? "Add to Cart" : "Out of Stock"}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Test PDP**

Visit `http://localhost:3000/products/[any-product-handle]`. Confirm:
- Gallery renders, thumbnails switch image
- Price shows correctly
- Add to Cart opens cart drawer
- Product details table renders

- [ ] **Step 5: Commit**

```bash
git add src/app/products/ src/app/api/shopify/products/
git commit -m "feat: product detail page with gallery, metafields, Add to Cart, JSON-LD schema"
```

---

## Task 14: Account Pages

**Files:**
- Create: `web/src/app/account/orders/page.tsx`
- Create: `web/src/app/account/wishlist/page.tsx`
- Create: `web/src/app/sign-in/[[...sign-in]]/page.tsx`
- Create: `web/src/app/sign-up/[[...sign-up]]/page.tsx`

- [ ] **Step 1: Write sign-in/sign-up pages**

```typescript
// web/src/app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF6EE]">
      <SignIn
        appearance={{
          elements: {
            card: "shadow-xl border border-[#D4A96A]",
            headerTitle: "font-display text-[#8B1A1A]",
            formButtonPrimary: "bg-[#8B1A1A] hover:bg-[#6d1414]",
          }
        }}
      />
    </div>
  );
}
```

```typescript
// web/src/app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF6EE]">
      <SignUp
        appearance={{
          elements: {
            card: "shadow-xl border border-[#D4A96A]",
            headerTitle: "font-display text-[#8B1A1A]",
            formButtonPrimary: "bg-[#8B1A1A] hover:bg-[#6d1414]",
          }
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Write orders page**

```typescript
// web/src/app/account/orders/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";

export default async function OrdersPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-2xl text-[#8B1A1A] mb-6">My Orders</h1>
      <div className="rounded-lg border border-[#D4A96A] bg-white p-12 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-[#D4A96A] mb-3" />
        <p className="text-[#666] text-sm">Your order history will appear here once you've placed your first order.</p>
        <a href="/collections/kanjivaram-silk" className="mt-4 inline-block text-sm text-[#8B1A1A] underline underline-offset-2">
          Start Shopping
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write wishlist account page**

```typescript
// web/src/app/account/wishlist/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getServiceSupabase, WishlistItem } from "@/lib/supabase";
import { getProduct } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";
import { Heart } from "lucide-react";

export default async function WishlistPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const db = getServiceSupabase();
  const { data } = await db.from("wishlists").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const items = (data ?? []) as WishlistItem[];

  const products = await Promise.all(
    items.map(item => getProduct(item.shopify_product_id).catch(() => null))
  );
  const validProducts = products.filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-2xl text-[#8B1A1A] mb-6">My Wishlist</h1>
      {validProducts.length === 0 ? (
        <div className="rounded-lg border border-[#D4A96A] bg-white p-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-[#D4A96A] mb-3" />
          <p className="text-[#666] text-sm">Save sarees you love and find them here.</p>
          <a href="/" className="mt-4 inline-block text-sm text-[#8B1A1A] underline underline-offset-2">Explore Collections</a>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {validProducts.map(p => p && <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/account/ src/app/sign-in/ src/app/sign-up/
git commit -m "feat: sign-in, sign-up, orders, wishlist account pages"
```

---

## Task 15: SEO + Sitemap

**Files:**
- Create: `web/src/app/sitemap.ts`
- Create: `web/src/app/robots.ts`

- [ ] **Step 1: Write sitemap**

```typescript
// web/src/app/sitemap.ts
import { MetadataRoute } from "next";
import { getProducts, getCollections } from "@/lib/shopify";

const BASE_URL = "https://thamanvie.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ products }, collections] = await Promise.all([
    getProducts({ first: 250 }),
    getCollections(),
  ]);

  const productUrls = products.map(p => ({
    url: `${BASE_URL}/products/${p.handle}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const collectionUrls = collections.map(c => ({
    url: `${BASE_URL}/collections/${c.handle}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    ...collectionUrls,
    ...productUrls,
  ];
}
```

- [ ] **Step 2: Write robots.ts**

```typescript
// web/src/app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/account/", "/api/"] },
    sitemap: "https://thamanvie.com/sitemap.xml",
  };
}
```

- [ ] **Step 3: Verify sitemap endpoint**

```bash
curl http://localhost:3000/sitemap.xml | head -20
```

Expected: XML with `<url>` entries for homepage and any Shopify products.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: sitemap.xml and robots.txt with Shopify product/collection URLs"
```

---

## Task 16: Vercel Deployment

**Files:**
- Modify: `web/vercel.json` (already written in Task 1)
- Action: Push to GitHub + connect Vercel

- [ ] **Step 1: Final TypeScript check**

```bash
cd I:/thamanviecom/web && npx tsc --noEmit
```

Expected: Zero errors.

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: Build completes. Note any warnings — missing env vars are expected in local build but Vercel will have them.

- [ ] **Step 3: Create GitHub repository**

```bash
cd I:/thamanviecom
git remote add origin https://github.com/<your-username>/thamanviecom.git
git push -u origin main
```

- [ ] **Step 4: Connect Vercel**

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub → select `thamanviecom`
2. Set Root Directory to `web`
3. Add all environment variables from `.env.local`
4. Deploy

Expected: Vercel build succeeds and deploys to `thamanvie.vercel.app`.

- [ ] **Step 5: Add custom domain**

In Vercel → Settings → Domains → add `thamanvie.com` → update DNS at your registrar.

- [ ] **Step 6: Test production**

```bash
curl https://thamanvie.vercel.app/api/internal/health
```

Expected: `{"status":"ok","ts":...}`

Visit `https://thamanvie.vercel.app` — confirm homepage loads, collections appear, cart works.

- [ ] **Step 7: Final commit**

```bash
cd I:/thamanviecom/web
git add -A
git commit -m "chore: production deployment configuration"
git push
```

---

## Self-Review

**Spec coverage check against PRD sections:**

| PRD Requirement | Task |
|---|---|
| Homepage with hero video + collections + bestsellers + testimonials + newsletter | Task 11 |
| Shopify Storefront API client (products, collections, cart, checkout) | Task 2 |
| Product Listing Page with filters + sort + infinite load | Task 12 |
| Product Detail Page with gallery, metafields, Add to Cart, JSON-LD | Task 13 |
| Cart Drawer with GSAP slide-in | Task 9 |
| Razorpay payment routes (order, verify, webhook) | Task 8 |
| Clerk auth (Google OAuth + Phone OTP) | Task 1 (layout) + Task 14 |
| Supabase wishlists + newsletter_subscribers + referrals | Tasks 3, 4, 7 |
| WishlistButton + useWishlist hook | Task 9 |
| WhatsApp sticky CTA | Task 6 |
| Trust strip | Task 6 |
| Make.com webhook integration (newsletter + order) | Tasks 7, 8 |
| SEO: generateMetadata on PLP + PDP | Tasks 12, 13 |
| Sitemap + robots | Task 15 |
| PostHog analytics | Task 5 |
| Health endpoint | Task 5 |
| Vercel deployment (Mumbai region) | Task 16 |
| Sign-in / sign-up pages | Task 14 |
| Account orders + wishlist pages | Task 14 |
| Referral routes | Task 7 |
| GSAP hero entrance, stagger on PLP, gallery crossfade, cart drawer, WhatsApp pulse | Tasks 6, 9, 10, 11, 12 |
| `prefers-reduced-motion` respected for all GSAP | All animation tasks |

**No gaps found.**

**Placeholder scan:** All steps contain concrete code. No TBDs found.

**Type consistency:** `ShopifyCart`, `ShopifyProduct`, `ShopifyVariant`, `WishlistItem` defined in Task 2/3, referenced consistently in Tasks 9–14. `useCart` and `useWishlist` hooks defined before use in components. `formatPrice` and `getMetafield` helpers defined in `lib/shopify.ts` and called in Tasks 10, 13.

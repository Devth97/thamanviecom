import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Browser/server client (anon key, RLS enforced)
export const supabase = createClient(url, anonKey);

// Server-only client (service role, bypasses RLS — use only in API routes)
export function getServiceSupabase() {
  return createClient(url, serviceKey);
}

// Exported types used across the app
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

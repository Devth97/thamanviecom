-- web/supabase/migrations/001_initial.sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Wishlists ─────────────────────────────────────────────────────────────────
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

-- ── Newsletter Subscribers ────────────────────────────────────────────────────
create table if not exists newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  phone text,
  coupon_sent boolean default false,
  source text default 'homepage',
  created_at timestamptz default now()
);

-- No RLS on newsletter_subscribers — server-side only via service role

-- ── Referrals ─────────────────────────────────────────────────────────────────
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

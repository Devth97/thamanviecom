import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/get-auth";
import { getServiceSupabase } from "@/lib/supabase";

export async function GET() {
  const userId = await requireAuth().catch(() => null);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getServiceSupabase();
  const { data, error } = await db
    .from("wishlists")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const userId = await requireAuth().catch(() => null);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.shopify_product_id) {
    return NextResponse.json({ error: "Missing shopify_product_id" }, { status: 400 });
  }

  const db = getServiceSupabase();
  const { error } = await db.from("wishlists").upsert(
    {
      user_id: userId,
      shopify_product_id: body.shopify_product_id,
      shopify_variant_id: body.shopify_variant_id ?? null,
    },
    { onConflict: "user_id,shopify_product_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const userId = await requireAuth().catch(() => null);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const shopify_product_id = searchParams.get("productId");
  if (!shopify_product_id) {
    return NextResponse.json({ error: "Missing productId query param" }, { status: 400 });
  }

  const db = getServiceSupabase();
  const { error } = await db
    .from("wishlists")
    .delete()
    .eq("user_id", userId)
    .eq("shopify_product_id", shopify_product_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

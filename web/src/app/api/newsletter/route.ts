import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !/\S+@\S+\.\S+/.test(body.email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { email, source = "homepage" } = body;
  const db = getServiceSupabase();
  const { error } = await db
    .from("newsletter_subscribers")
    .upsert({ email, source }, { onConflict: "email" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (process.env.MAKE_WEBHOOK_URL) {
    await fetch(process.env.MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "newsletter_signup", email, source }),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}

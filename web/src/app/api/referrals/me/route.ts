import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/get-auth";
import { getReferralStats } from "@/lib/referrals";

export async function GET() {
  const userId = await requireAuth().catch(() => null);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const stats = await getReferralStats(userId);
    return NextResponse.json(stats);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/get-auth";
import { generateReferralCode } from "@/lib/referrals";

export async function POST() {
  const userId = await requireAuth().catch(() => null);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ code: generateReferralCode(userId) });
}

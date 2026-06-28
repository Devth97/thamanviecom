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
  const { data, error } = await db
    .from("referrals")
    .select("*")
    .eq("referrer_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch referrals: ${error.message}`);

  const referrals = (data ?? []) as Referral[];

  return {
    code: generateReferralCode(userId),
    totalReferrals: referrals.length,
    pendingAmount: referrals
      .filter((r) => r.status === "pending")
      .reduce((s, r) => s + r.commission_amount, 0),
    paidAmount: referrals
      .filter((r) => r.status === "paid")
      .reduce((s, r) => s + r.commission_amount, 0),
    referrals,
  };
}

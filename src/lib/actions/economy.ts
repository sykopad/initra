"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * PRO STIPEND LOGIC
 * Automatically refills credits for Pro users on their billing anniversary.
 * In a real production env, this would be triggered by a Supabase Edge Function cron job.
 */
export async function processProStipends() {
  const supabase = await createClient();
  
  // 1. Find Pro users whose refill date has passed
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, credits, next_refill_at, tier')
    .eq('tier', 'pro')
    .lte('next_refill_at', new Date().toISOString());

  if (error || !profiles) {
    console.error("[Economy] Error fetching stipend targets:", error);
    return { success: false, error };
  }

  const results = [];

  for (const profile of profiles) {
    // 2. Add stipend (e.g., 500 credits per month for Pro)
    const STIPEND_AMOUNT = 500;
    const newCredits = (profile.credits || 0) + STIPEND_AMOUNT;
    
    // 3. Calculate next refill (now + 30 days)
    const nextRefill = new Date();
    nextRefill.setDate(nextRefill.getDate() + 30);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        credits: newCredits, 
        next_refill_at: nextRefill.toISOString() 
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error(`[Economy] Failed to refill for ${profile.id}:`, updateError);
      results.push({ id: profile.id, status: 'error' });
    } else {
      // 4. Log transaction
      await supabase.from('credit_transactions').insert({
        profile_id: profile.id,
        amount: STIPEND_AMOUNT,
        type: 'stipend',
        description: `Automated Monthly Pro Stipend (+${STIPEND_AMOUNT})`
      });
      results.push({ id: profile.id, status: 'success' });
    }
  }

  revalidatePath('/dashboard');
  return { success: true, processed: results.length, details: results };
}

/**
 * REFERRAL LEADERBOARD
 * Fetches the top contributors to the Initra ecosystem.
 */
export async function getReferralLeaderboard() {
  const supabase = await createClient();
  
  // We'll use a virtual 'referral_count' for now or calculate from community activity
  // In a full implementation, this would query a dedicated 'referrals' table
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, referral_count, tier')
    .order('referral_count', { ascending: false })
    .limit(10);

  if (error) return [];
  return data;
}

/**
 * CLAIM REFERRAL CREDIT
 * Awards credits for inviting a new user.
 */
export async function claimReferralCredit(referralCode: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Logic to verify code and award credits (50 credits per referral)
  // ... implementation simplified for roadmap ...
  
  return { success: true, reward: 50 };
}

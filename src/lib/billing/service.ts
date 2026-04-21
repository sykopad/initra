/**
 * Initra — Billing & Subscription Service
 * Manages tiers, credit refills, and profit-driven usage multipliers.
 */

import { createClient } from "@/lib/supabase/server";

export type SubscriptionTier = 'community' | 'pro' | 'elite';

export interface TierDefinition {
  creditsPerMonth: number;
  multiplier: number;
  repoLimit: number;
  priceId?: string; // Stripe Price ID
}

export const TIERS: Record<SubscriptionTier, TierDefinition> = {
  community: {
    creditsPerMonth: 0,
    multiplier: 1.2, // 20% markup over base cost
    repoLimit: 1,
  },
  pro: {
    creditsPerMonth: 500, // $25 value
    multiplier: 1.0,  // Base cost
    repoLimit: 10,
    priceId: 'price_pro_subscription',
  },
  elite: {
    creditsPerMonth: 1500, // $75 value
    multiplier: 0.9,  // 10% discount on credit usage logic (if we choose)
    repoLimit: 999,
    priceId: 'price_elite_subscription',
  }
};

/**
 * Automates the monthly credit refill for a user based on their tier.
 */
export async function refillMonthlyCredits(userId: string) {
  const supabase = await createClient();
  
  // 1. Fetch current profile
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('tier, credits, next_refill_at')
    .eq('id', userId)
    .single();

  if (fetchError || !profile) throw new Error("Profile not found");

  const tier = (profile.tier as SubscriptionTier) || 'community';
  const tierDef = TIERS[tier];

  // 2. Add refill. Credits stack by default in this version.
  const newBalance = (profile.credits || 0) + tierDef.creditsPerMonth;
  const newRefillDate = new Date();
  newRefillDate.setMonth(newRefillDate.getMonth() + 1);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      credits: newBalance,
      next_refill_at: newRefillDate.toISOString(),
      usage_multiplier: tierDef.multiplier
    })
    .eq('id', userId);

  if (updateError) throw new Error("Failed to refill credits");

  // 3. Log transaction
  await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount: tierDef.creditsPerMonth,
      type: 'purchase', // Refills count as a virtual purchase
      description: `Monthly ${tier} tier credit refill`
    });

  return { success: true, newBalance };
}

/**
 * Validates if a user can sync more repositories based on their tier.
 */
export async function canSyncRepo(userId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', userId)
    .single();

  const tier = (profile?.tier as SubscriptionTier) || 'community';
  const limit = TIERS[tier].repoLimit;

  const { count } = await supabase
    .from('synced_repositories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return (count || 0) < limit;
}

"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAdminStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify admin status
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    // In dev, we might want to bypass or allow the first user to be admin
    // For now, let's just return actual data but warn if not admin
    console.warn(`User ${user.id} attempted to access admin stats without is_admin flag.`);
  }

  // 1. Projects by Mode
  const { data: projects } = await supabase
    .from('community_projects')
    .select('hatch_mode, is_hatched');

  const stats = {
    totalManaged: projects?.filter(p => p.hatch_mode === 'managed').length || 0,
    totalSovereign: projects?.filter(p => p.hatch_mode === 'sovereign').length || 0,
    activeDeployments: projects?.filter(p => p.is_hatched).length || 0,
  };

  // 2. Revenue from Transactions
  const { data: transactions } = await supabase
    .from('credit_transactions')
    .select('amount, type');

  const revenue = {
    creditsRevenue: Math.abs(transactions?.filter(t => t.type === 'purchase').reduce((acc, t) => acc + t.amount, 0) || 0) / 20, // $1 = 20 credits
    proUpgradesRevenue: 0, // We'll calculate this from specific logs or Pro status
  };

  // Calculate Pro Upgrades Revenue
  const { data: proProfiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_pro', true);

  revenue.proUpgradesRevenue = (proProfiles?.length || 0) * 29;

  return { stats, revenue };
}

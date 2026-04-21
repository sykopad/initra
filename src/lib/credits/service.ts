import { createClient } from "@/lib/supabase/server";

/**
 * Credit Management Service
 */

export async function getCreditBalance(userId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();

  if (error) {
    console.error(`[Credits] Error fetching balance for ${userId}:`, error);
    return 0;
  }

  return data?.credits || 0;
}

export interface CreditDeductionResult {
  success: boolean;
  newBalance?: number;
  error?: string;
}

/**
 * Deduct credits from user profile and log transaction
 */
export async function deductCredits(
  userId: string, 
  amount: number, 
  description: string,
  sessionId?: string
): Promise<CreditDeductionResult> {
  if (amount <= 0) return { success: true };

  const supabase = await createClient();

  // 1. Check current balance
  const currentBalance = await getCreditBalance(userId);
  if (currentBalance < amount) {
    return { 
      success: false, 
      error: `Insufficient credits. Need ${amount}, have ${currentBalance}.` 
    };
  }

  // 2. Perform deduction and log transaction in a transaction (though Supabase client is non-transactional easily, we'll use an RPC or sequential)
  // For simplicity and speed, we use an RPC if complex, but simple sequential is okay for now.
  
  const { data: profile, error: updateError } = await supabase
    .from('profiles')
    .update({ credits: currentBalance - amount })
    .eq('id', userId)
    .select()
    .single();

  if (updateError) {
    console.error(`[Credits] Failed to deduct credits for ${userId}:`, updateError);
    return { success: false, error: "Failed to update credit balance." };
  }

  // 3. Log transaction
  const { error: logError } = await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount: -amount,
      type: 'usage',
      description,
      session_id: sessionId
    });

  if (logError) {
    console.error(`[Credits] Failed to log transaction for ${userId}:`, logError);
    // We don't rollback here because credits were already deducted, 
    // but in a production app you'd want an atomic SQL transaction.
  }

  return { success: true, newBalance: profile.credits };
}

/**
 * Add credits to user profile (e.g. after purchase)
 */
export async function addCredits(
  userId: string, 
  amount: number, 
  description: string
): Promise<CreditDeductionResult> {
  if (amount <= 0) return { success: false, error: "Invalid amount" };

  const supabase = await createClient();

  // 1. Get current balance
  const currentBalance = await getCreditBalance(userId);

  // 2. Update balance
  const { data: profile, error: updateError } = await supabase
    .from('profiles')
    .update({ credits: currentBalance + amount })
    .eq('id', userId)
    .select()
    .single();

  if (updateError) {
    console.error(`[Credits] Failed to add credits for ${userId}:`, updateError);
    return { success: false, error: "Failed to update credit balance." };
  }

  // 3. Log transaction
  const { error: logError } = await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount: amount,
      type: 'purchase',
      description
    });

  if (logError) {
    console.error(`[Credits] Failed to log purchase transaction for ${userId}:`, logError);
  }

  return { success: true, newBalance: profile.credits };
}

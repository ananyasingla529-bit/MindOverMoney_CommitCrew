import { supabase, isSupabaseConfigured } from './supabaseClient';
import { updateUserBalance } from './userService';

const STORAGE_KEY_INVESTMENTS = 'mom_practice_investments';

/**
 * Fetches all past practice investments for the user from Supabase or localStorage.
 */
export async function getUserInvestments(userId) {
  let localInvestments = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INVESTMENTS);
    if (raw) localInvestments = JSON.parse(raw);
  } catch {}

  if (isSupabaseConfigured() && supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('practice_investments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('Failed to load investments from Supabase, using local:', err);
    }
  }

  return localInvestments;
}

/**
 * Records a new practice investment, deducting coins from user_profiles.
 */
export async function createPracticeInvestment({
  userId,
  asset,
  coinsInvested,
  currentCoins,
  scenario,
  returnPct
}) {
  if (coinsInvested <= 0 || coinsInvested > currentCoins) {
    return { success: false, error: 'Insufficient virtual coins.' };
  }

  const entryPrice = parseFloat(asset.price);
  const currentPrice = parseFloat((entryPrice * (1 + returnPct / 100)).toFixed(2));
  const endingCoins = Math.round(coinsInvested * (1 + returnPct / 100));
  const profitLoss = endingCoins - coinsInvested;

  // Deduct invested coins
  const remainingCoins = currentCoins - coinsInvested;
  await updateUserBalance(userId, remainingCoins);

  const newRecord = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    user_id: userId,
    asset_id: asset.id,
    asset_name: asset.name,
    asset_symbol: asset.symbol,
    coins_invested: coinsInvested,
    entry_price: entryPrice,
    current_price: currentPrice,
    profit_loss: profitLoss,
    scenario: scenario,
    created_at: new Date().toISOString()
  };

  // 1. Supabase Persistence
  if (isSupabaseConfigured() && supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('practice_investments')
        .insert([
          {
            id: newRecord.id,
            user_id: userId,
            asset_id: asset.id,
            coins_invested: coinsInvested,
            entry_price: entryPrice,
            current_price: currentPrice,
            profit_loss: profitLoss,
            scenario: scenario
          }
        ])
        .select()
        .single();

      if (!error && data) {
        newRecord.persisted = true;
      }
    } catch (err) {
      console.warn('Error saving practice investment to Supabase:', err);
    }
  }

  // 2. Local Storage Persistence
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INVESTMENTS);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(newRecord);
    localStorage.setItem(STORAGE_KEY_INVESTMENTS, JSON.stringify(list));
  } catch {}

  return {
    success: true,
    investment: newRecord,
    newBalance: remainingCoins
  };
}

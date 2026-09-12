import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY_USER_ID = 'mom_anonymous_user_id';
const STORAGE_KEY_COINS = 'mom_user_coins';
const STORAGE_KEY_SCORE = 'mom_user_quiz_score';

/**
 * Generates or retrieves an anonymous UUID for this browser session.
 * Complies with the RFC4122 v4 UUID format.
 */
export function getLocalUserId() {
  let userId = localStorage.getItem(STORAGE_KEY_USER_ID);
  if (!userId) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      userId = crypto.randomUUID();
    } else {
      userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
    localStorage.setItem(STORAGE_KEY_USER_ID, userId);
  }
  return userId;
}

/**
 * Loads or initializes the user profile in Supabase user_profiles.
 * Falls back to local storage if Supabase is offline or unconfigured.
 */
export async function getOrCreateUserProfile(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      // 1. Check if profile exists
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Supabase fetch user_profiles error:', error);
      }

      if (data) {
        localStorage.setItem(STORAGE_KEY_COINS, data.coins.toString());
        localStorage.setItem(STORAGE_KEY_SCORE, data.total_quiz_score.toString());
        return { profile: data, isSupabase: true };
      }

      // 2. If not found, create new anonymous profile with 150 starting coins
      const initialCoins = parseInt(localStorage.getItem(STORAGE_KEY_COINS) || '150', 10);
      const initialScore = parseInt(localStorage.getItem(STORAGE_KEY_SCORE) || '0', 10);

      const newProfile = {
        id: userId,
        coins: initialCoins,
        total_quiz_score: initialScore
      };

      const { data: inserted, error: insertError } = await supabase
        .from('user_profiles')
        .insert([newProfile])
        .select()
        .single();

      if (!insertError && inserted) {
        return { profile: inserted, isSupabase: true };
      }
    } catch (err) {
      console.warn('Falling back to local user profile due to Supabase error:', err);
    }
  }

  // Local Storage Fallback
  const coins = parseInt(localStorage.getItem(STORAGE_KEY_COINS) || '150', 10);
  const score = parseInt(localStorage.getItem(STORAGE_KEY_SCORE) || '0', 10);

  return {
    profile: {
      id: userId,
      coins,
      total_quiz_score: score,
      created_at: new Date().toISOString()
    },
    isSupabase: false
  };
}

/**
 * Updates coins and optional quiz score in Supabase and local storage.
 */
export async function updateUserBalance(userId, newCoins, scoreDelta = 0) {
  // Always update local storage
  localStorage.setItem(STORAGE_KEY_COINS, newCoins.toString());

  if (isSupabaseConfigured() && supabase) {
    try {
      const updateData = { coins: newCoins };
      if (scoreDelta !== 0) {
        // Fetch current score or update
        const { data } = await supabase.from('user_profiles').select('total_quiz_score').eq('id', userId).single();
        if (data) {
          updateData.total_quiz_score = (data.total_quiz_score || 0) + scoreDelta;
          localStorage.setItem(STORAGE_KEY_SCORE, updateData.total_quiz_score.toString());
        }
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.warn('Supabase update user_profiles error:', error);
      }
    } catch (err) {
      console.warn('Error updating Supabase user profile:', err);
    }
  }
}

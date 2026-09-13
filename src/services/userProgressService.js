import { supabase, isSupabaseConfigured } from './supabaseClient';

const getUserKey = (baseKey, userId) => {
  const safeId = userId || 'demo_guest';
  return `${baseKey}_${safeId}`;
};

const BASE_KEYS = {
  COINS: 'mom_user_coins',
  BOOKMARKS: 'mom_bookmarked_assets',
  INVESTMENTS: 'mom_user_investments',
  QUIZ_ATTEMPTS: 'mom_quiz_attempts',
  DECISIONS: 'mom_saved_decisions'
};

/**
 * User Progress Persistence Service
 * Strict user-scoped isolation for every account.
 * Manages dual-mode persistence: Supabase PostgreSQL when authenticated,
 * and isolated per-user LocalStorage fallback.
 */

// 1. Fetch User Profile
export async function fetchUserProfile(userId) {
  if (!userId) {
    return { id: 'guest', full_name: 'Guest Investor', practice_coins: 100 };
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) return data;
    } catch (err) {
      console.warn('Failed to fetch user profile from Supabase:', err);
    }
  }

  // Fallback to user-scoped localStorage
  const savedCoins = localStorage.getItem(getUserKey(BASE_KEYS.COINS, userId));
  return {
    id: userId,
    full_name: 'Investor',
    practice_coins: savedCoins !== null ? parseInt(savedCoins, 10) : 100
  };
}

// 2. Update Practice Coins
export async function syncPracticeCoins(userId, coins) {
  if (!userId) return;
  localStorage.setItem(getUserKey(BASE_KEYS.COINS, userId), coins.toString());

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('user_profiles')
        .update({ practice_coins: coins, updated_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (err) {
      console.warn('Failed to sync practice coins to Supabase:', err);
    }
  }
}

// 3. Fetch & Sync Bookmarks
export async function fetchUserBookmarks(userId) {
  if (!userId) return [];

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('asset_id')
        .eq('user_id', userId);

      if (!error && data) {
        return data.map(b => b.asset_id);
      }
    } catch (err) {
      console.warn('Failed to fetch bookmarks from Supabase:', err);
    }
  }

  const saved = localStorage.getItem(getUserKey(BASE_KEYS.BOOKMARKS, userId));
  return saved ? JSON.parse(saved) : ['vanguard-sp500-etf', 'apple-inc'];
}

export async function toggleUserBookmarkDb(userId, assetId, isBookmarked) {
  if (!userId) return [];
  const current = await fetchUserBookmarks(userId);
  let updated;
  if (isBookmarked) {
    updated = current.filter(id => id !== assetId);
  } else {
    updated = [...current, assetId];
  }
  localStorage.setItem(getUserKey(BASE_KEYS.BOOKMARKS, userId), JSON.stringify(updated));

  if (isSupabaseConfigured() && supabase) {
    try {
      if (isBookmarked) {
        await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('asset_id', assetId);
      } else {
        await supabase
          .from('user_bookmarks')
          .insert({ user_id: userId, asset_id: assetId });
      }
    } catch (err) {
      console.warn('Failed to sync bookmark to Supabase:', err);
    }
  }

  return updated;
}

// 4. Fetch & Record Quiz Attempt
export async function recordQuizAttemptDb(userId, { quizId, score, totalQuestions, coinsEarned }) {
  if (!userId) return;
  const attemptsKey = getUserKey(BASE_KEYS.QUIZ_ATTEMPTS, userId);
  const attempts = JSON.parse(localStorage.getItem(attemptsKey) || '[]');
  const newAttempt = {
    id: 'local-' + Date.now(),
    quizId,
    score,
    totalQuestions,
    coinsEarned,
    attemptedAt: new Date().toISOString()
  };
  attempts.push(newAttempt);
  localStorage.setItem(attemptsKey, JSON.stringify(attempts));

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('quiz_attempts')
        .insert({
          user_id: userId,
          quiz_id: quizId || 'general-quiz',
          score,
          total_questions: totalQuestions,
          coins_earned: coinsEarned
        });
    } catch (err) {
      console.warn('Failed to record quiz attempt in Supabase:', err);
    }
  }
}

// 5. Fetch & Save Practice Investments
export async function fetchUserInvestments(userId) {
  if (!userId) return [];

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('practice_investments')
        .select('*')
        .eq('user_id', userId);

      if (!error && data) return data;
    } catch (err) {
      console.warn('Failed to fetch investments from Supabase:', err);
    }
  }

  const saved = localStorage.getItem(getUserKey(BASE_KEYS.INVESTMENTS, userId));
  return saved ? JSON.parse(saved) : [];
}

export async function saveUserInvestmentDb(userId, investmentData) {
  if (!userId) return;
  const investments = await fetchUserInvestments(userId);
  const existingIdx = investments.findIndex(inv => inv.asset_id === investmentData.assetId);

  let updated;
  if (existingIdx >= 0) {
    updated = [...investments];
    updated[existingIdx] = { ...updated[existingIdx], ...investmentData };
  } else {
    updated = [...investments, investmentData];
  }
  localStorage.setItem(getUserKey(BASE_KEYS.INVESTMENTS, userId), JSON.stringify(updated));

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('practice_investments')
        .upsert({
          user_id: userId,
          asset_id: investmentData.assetId,
          amount_invested: investmentData.amountInvested,
          shares_owned: investmentData.sharesOwned,
          avg_buy_price: investmentData.avgBuyPrice,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,asset_id' });
    } catch (err) {
      console.warn('Failed to save investment to Supabase:', err);
    }
  }
}

// 6. Fetch & Save Decisions
export async function fetchUserDecisions(userId) {
  if (!userId) return [];

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('saved_decisions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) return data;
    } catch (err) {
      console.warn('Failed to fetch decisions from Supabase:', err);
    }
  }

  const saved = localStorage.getItem(getUserKey(BASE_KEYS.DECISIONS, userId));
  return saved ? JSON.parse(saved) : [];
}

export async function saveUserDecisionDb(userId, decisionData) {
  if (!userId) return;
  const decisions = await fetchUserDecisions(userId);
  const updated = [decisionData, ...decisions];
  localStorage.setItem(getUserKey(BASE_KEYS.DECISIONS, userId), JSON.stringify(updated));

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('saved_decisions')
        .insert({
          user_id: userId,
          asset_id: decisionData.assetId,
          verdict: decisionData.verdict,
          summary: decisionData.summary
        });
    } catch (err) {
      console.warn('Failed to save decision to Supabase:', err);
    }
  }
}

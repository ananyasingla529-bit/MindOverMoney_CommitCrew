import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getLocalUserId, getOrCreateUserProfile, updateUserBalance } from '../services/userService';
import { useAuth } from './AuthContext';
import { fetchUserQuizAttempts, submitQuizAttempt } from '../services/quizService';
import { getUserInvestments, createPracticeInvestment } from '../services/investmentsService';
import { isSupabaseConfigured } from '../services/supabaseClient';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  COINS: 'mom_user_coins',
  DECISIONS: 'mom_saved_decisions',
  BOOKMARKS: 'mom_bookmarked_assets',
};

export function AppProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [supabaseStatus, setSupabaseStatus] = useState('checking'); // 'connected' | 'fallback'

  // User profile state
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COINS);
    return saved !== null ? parseInt(saved, 10) : 150;
  });
  const [quizScore, setQuizScore] = useState(0);

  // Quiz progress / attempts map: { [qId]: { selectedIndex, isCorrect, coinsEarned } }
  const [quizProgress, setQuizProgress] = useState({ answered: {}, totalEarned: 0 });

  // User's practice investments list
  const [investments, setInvestments] = useState([]);

  // Gemini AI Key state
  const [geminiApiKey, setGeminiApiKeyState] = useState(() => {
    return localStorage.getItem('mom_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  });

  const setGeminiApiKey = useCallback((key) => {
    const trimmed = (key || '').trim();
    setGeminiApiKeyState(trimmed);
    if (trimmed) {
      localStorage.setItem('mom_gemini_api_key', trimmed);
    } else {
      localStorage.removeItem('mom_gemini_api_key');
    }
  }, []);

  // Saved decision analyses
  const [savedDecisions, setSavedDecisions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DECISIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Bookmarks
  const [bookmarkedAssets, setBookmarkedAssets] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return saved ? JSON.parse(saved) : ['vanguard-sp500-etf', 'apple-inc'];
    } catch {
      return ['vanguard-sp500-etf', 'apple-inc'];
    }
  });

  // 1. Initial Load: Load profile, quiz attempts, and investments from Supabase
  useEffect(() => {
    let isMounted = true;

    async function initializeUserData() {
      try {
        if (!userId) return; // Do not initialize until user is available

        // Load or create user profile
        const { profile, isSupabase } = await getOrCreateUserProfile(userId);
        if (isMounted) {
          if (profile) {
            setCoins(profile.coins ?? 150);
            setQuizScore(profile.total_quiz_score ?? 0);
          }
          setSupabaseStatus(isSupabase ? 'connected' : 'fallback');
        }

        // Load quiz attempts
        const attempts = await fetchUserQuizAttempts(userId);
        if (isMounted) {
          const totalEarned = Object.values(attempts).reduce((acc, a) => acc + (a.coinsEarned || 0), 0);
          setQuizProgress({ answered: attempts, totalEarned });
        }

        // Load investments
        const userInvs = await getUserInvestments(userId);
        if (isMounted) {
          setInvestments(userInvs || []);
        }
      } catch (err) {
        console.warn('Initialization error:', err);
        if (isMounted) setSupabaseStatus('fallback');
      }
    }

    initializeUserData();
    return () => { isMounted = false; };
  }, [userId]);

  // Synchronize local storage backups
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COINS, coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(savedDecisions));
  }, [savedDecisions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarkedAssets));
  }, [bookmarkedAssets]);

  const addCoins = useCallback(async (amount) => {
    setCoins(prev => {
      const updated = Math.max(0, prev + amount);
      updateUserBalance(userId, updated);
      return updated;
    });
  }, [userId]);

  const spendCoins = useCallback(async (amount) => {
    if (coins < amount) return false;
    const updated = coins - amount;
    setCoins(updated);
    await updateUserBalance(userId, updated);
    return true;
  }, [coins, userId]);

  // Record Quiz Answer with database persistence & duplicate reward prevention
  const recordQuizAnswer = useCallback(async (questionId, selectedIndex, isCorrect, reward = 50) => {
    // Check if already answered in local state
    if (quizProgress.answered[questionId]) {
      return { alreadyAnswered: true };
    }

    const result = await submitQuizAttempt({
      userId,
      questionId,
      selectedIndex,
      isCorrect,
      coinsAwarded: reward,
      currentCoins: coins
    });

    if (result.alreadyAnswered) {
      return { alreadyAnswered: true };
    }

    // Update state
    setQuizProgress(prev => ({
      answered: {
        ...prev.answered,
        [questionId]: { selectedIndex, isCorrect, coinsEarned: result.coinsEarned }
      },
      totalEarned: prev.totalEarned + result.coinsEarned
    }));

    if (isCorrect && result.coinsEarned > 0) {
      setCoins(prev => prev + result.coinsEarned);
      setQuizScore(prev => prev + result.coinsEarned);
    }

    return result;
  }, [userId, coins, quizProgress.answered]);

  // Record Practice Investment with Supabase persistence
  const recordInvestment = useCallback(async ({ asset, coinsInvested, scenario, returnPct }) => {
    const res = await createPracticeInvestment({
      userId,
      asset,
      coinsInvested,
      currentCoins: coins,
      scenario,
      returnPct
    });

    if (res.success) {
      setCoins(res.newBalance);
      setInvestments(prev => [res.investment, ...prev]);
    }
    return res;
  }, [userId, coins]);

  const resetQuiz = useCallback(() => {
    setQuizProgress({ answered: {}, totalEarned: 0 });
    localStorage.removeItem('mom_quiz_progress');
  }, []);

  const saveDecision = useCallback((decisionRecord) => {
    setSavedDecisions(prev => [
      { id: Date.now().toString(), date: new Date().toISOString(), ...decisionRecord },
      ...prev
    ]);
  }, []);

  const toggleBookmark = useCallback((assetId) => {
    setBookmarkedAssets(prev =>
      prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]
    );
  }, []);

  const resetAllData = useCallback(() => {
    setCoins(150);
    setQuizScore(0);
    setQuizProgress({ answered: {}, totalEarned: 0 });
    setSavedDecisions([]);
    setInvestments([]);
    setBookmarkedAssets(['vanguard-sp500-etf']);
    localStorage.clear();
  }, []);

  return (
    <AppContext.Provider
      value={{
        userId,
        supabaseStatus,
        isSupabaseReady: isSupabaseConfigured(),
        coins,
        quizScore,
        addCoins,
        spendCoins,
        quizProgress,
        recordQuizAnswer,
        resetQuiz,
        investments,
        recordInvestment,
        savedDecisions,
        saveDecision,
        bookmarkedAssets,
        toggleBookmark,
        geminiApiKey,
        setGeminiApiKey,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

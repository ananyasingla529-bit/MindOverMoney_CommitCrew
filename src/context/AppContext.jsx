import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { 
  fetchUserProfile, 
  syncPracticeCoins, 
  fetchUserBookmarks, 
  toggleUserBookmarkDb, 
  recordQuizAttemptDb, 
  fetchUserInvestments, 
  saveUserInvestmentDb, 
  fetchUserDecisions, 
  saveUserDecisionDb 
} from '../services/userProgressService';
import { fetchUserQuizAttempts, submitQuizAttempt } from '../services/quizService';
import { createPracticeInvestment } from '../services/investmentsService';

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
    return saved !== null ? parseInt(saved, 10) : 100;
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
  const [savedDecisions, setSavedDecisions] = useState([]);

  // Bookmarks
  const [bookmarkedAssets, setBookmarkedAssets] = useState(['vanguard-sp500-etf', 'apple-inc']);

  // 1. Initial Load & User Switch: Load profile, quiz attempts, bookmarks, decisions, and investments
  useEffect(() => {
    let isMounted = true;

    async function initializeUserData() {
      try {
        setSupabaseStatus(isSupabaseConfigured() ? 'connected' : 'fallback');

        // Load profile & practice coins
        const profile = await fetchUserProfile(userId);
        if (isMounted && profile) {
          setCoins(profile.practice_coins ?? 100);
          setQuizScore(profile.xp ?? 0);
        }

        // Load bookmarks
        const bookmarks = await fetchUserBookmarks(userId);
        if (isMounted && bookmarks && bookmarks.length > 0) {
          setBookmarkedAssets(bookmarks);
        }

        // Load quiz attempts
        const attempts = await fetchUserQuizAttempts(userId);
        if (isMounted && attempts) {
          const totalEarned = Object.values(attempts).reduce((acc, a) => acc + (a.coinsEarned || 0), 0);
          setQuizProgress({ answered: attempts, totalEarned });
        }

        // Load investments
        const userInvs = await fetchUserInvestments(userId);
        if (isMounted && userInvs) {
          setInvestments(userInvs);
        }

        // Load saved decisions
        const decisions = await fetchUserDecisions(userId);
        if (isMounted && decisions) {
          setSavedDecisions(decisions);
        }
      } catch (err) {
        console.warn('Initialization error:', err);
        if (isMounted) setSupabaseStatus('fallback');
      }
    }

    initializeUserData();
    return () => { isMounted = false; };
  }, [userId]);

  // Synchronize local storage backups & DB coins
  useEffect(() => {
    syncPracticeCoins(userId, coins);
  }, [coins, userId]);

  const addCoins = useCallback(async (amount) => {
    setCoins(prev => {
      const updated = Math.max(0, prev + amount);
      return updated;
    });
  }, []);

  const spendCoins = useCallback(async (amount) => {
    if (coins < amount) return false;
    const updated = coins - amount;
    setCoins(updated);
    return true;
  }, [coins]);

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

    // Record in user progress service
    await recordQuizAttemptDb(userId, {
      quizId: questionId,
      score: isCorrect ? 100 : 0,
      totalQuestions: 1,
      coinsEarned: result.coinsEarned
    });

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

      await saveUserInvestmentDb(userId, {
        assetId: asset?.id || 'asset',
        amountInvested: coinsInvested,
        sharesOwned: res.investment.sharesOwned || 1,
        avgBuyPrice: asset?.price || 100
      });
    }
    return res;
  }, [userId, coins]);

  const resetQuiz = useCallback(() => {
    setQuizProgress({ answered: {}, totalEarned: 0 });
    localStorage.removeItem('mom_quiz_attempts');
  }, []);

  const saveDecision = useCallback(async (decisionRecord) => {
    const newRecord = { id: Date.now().toString(), date: new Date().toISOString(), ...decisionRecord };
    setSavedDecisions(prev => [newRecord, ...prev]);
    await saveUserDecisionDb(userId, {
      assetId: decisionRecord.assetId || decisionRecord.asset?.id || 'general',
      verdict: decisionRecord.verdict || 'BUY',
      summary: decisionRecord.summary || JSON.stringify(decisionRecord)
    });
  }, [userId]);

  const toggleBookmark = useCallback(async (assetId) => {
    setBookmarkedAssets(prev => {
      const isBookmarked = prev.includes(assetId);
      toggleUserBookmarkDb(userId, assetId, isBookmarked);
      return isBookmarked ? prev.filter(id => id !== assetId) : [...prev, assetId];
    });
  }, [userId]);

  const resetAllData = useCallback(() => {
    setCoins(100);
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

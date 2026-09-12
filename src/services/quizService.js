import { supabase, isSupabaseConfigured } from './supabaseClient';
import { updateUserBalance } from './userService';

export const FALLBACK_QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'Why is starting to invest early often more powerful than waiting to invest larger sums later?',
    options: [
      'The government gives bonuses to younger investors',
      'Compound interest allows your earnings to earn their own earnings over decades',
      'Stock prices are cheaper in your 20s than your 40s',
      'Older investors are legally restricted from high-growth funds'
    ],
    correctIndex: 1,
    correctAnswerLetter: 'B',
    explanation: 'Compound interest acts like a snowball. Given 20–30 years, the majority of your wealth comes from compound returns on your gains, not the original dollars you deposited!',
    coins: 50
  },
  {
    id: 'q2',
    question: 'What is the primary benefit of buying an index fund (like an S&P 500 ETF) rather than an individual stock?',
    options: [
      'Index funds are guaranteed by law to never lose money',
      'Instant diversification: you own slices of hundreds of companies so one failure doesn\'t ruin you',
      'Index funds never charge any fees or expenses',
      'You get to vote on daily company board decisions'
    ],
    correctIndex: 1,
    correctAnswerLetter: 'B',
    explanation: 'Diversification protects you against catastrophic single-company collapse. If 1 company in 500 struggles, 499 others keep your portfolio balanced.',
    coins: 50
  },
  {
    id: 'q3',
    question: 'If an investment sponsor promises "30% guaranteed returns every year with zero risk of loss", what is the reality?',
    options: [
      'It is an exceptional opportunity you should invest all your savings in',
      'It is almost certainly a scam or misleading marketing; high return always entails risk',
      'It is a standard high-yield savings account rate',
      'It is guaranteed by central banks'
    ],
    correctIndex: 1,
    correctAnswerLetter: 'B',
    explanation: 'The fundamental iron rule of finance: Risk and return are inextricably linked. Anyone offering high returns with "zero risk" is either hiding severe danger or running an outright scam.',
    coins: 50
  },
  {
    id: 'q4',
    question: 'What happens to cash left sitting in a 0.01% checking account over 10 years during periods of 3% inflation?',
    options: [
      'Its dollar amount decreases directly',
      'It stays exactly the same in terms of purchasing power',
      'Its purchasing power steadily erodes because prices rise faster than your interest',
      'It automatically converts into stock shares'
    ],
    correctIndex: 2,
    correctAnswerLetter: 'C',
    explanation: 'While the dollar balance on your bank app looks unchanged, inflation makes groceries and housing more expensive. After 10 years at 3% inflation, $10,000 only buys what ~$7,400 buys today.',
    coins: 50
  },
  {
    id: 'q5',
    question: 'During a market downturn where your portfolio drops 20%, what has historically produced the best long-term outcome for index investors?',
    options: [
      'Panic-selling everything immediately to prevent further drops',
      'Remaining patient, continuing to invest consistently (dollar-cost averaging), and waiting for recovery',
      'Checking your portfolio balance every 10 minutes',
      'Borrowing maximum credit card debt to trade volatile meme coins'
    ],
    correctIndex: 1,
    correctAnswerLetter: 'B',
    explanation: 'Paper losses are only locked in when you sell at the bottom. Historically, every major bear market and recession in modern history has eventually been followed by new all-time highs for diversified broad market indices.',
    coins: 50
  },
  {
    id: 'q6',
    question: 'Why do financial advisors emphasize looking for low expense ratios (e.g. 0.03% vs 1.50%) on funds?',
    options: [
      'High fee funds perform 10x better on average',
      'A 1.5% annual fee can eat away over 30% to 40% of your total lifetime nest egg over 30 years',
      'Expense ratios are paid directly in cash to the IRS',
      'Funds with low fees don\'t have customer support'
    ],
    correctIndex: 1,
    correctAnswerLetter: 'B',
    explanation: 'Fees compound in reverse against you! Over 30 years, paying an extra 1.5% every year subtracts hundreds of thousands in missed compound growth.',
    coins: 50
  }
];

const LETTER_TO_INDEX = { A: 0, B: 1, C: 2, D: 3 };
const INDEX_TO_LETTER = ['A', 'B', 'C', 'D'];

/**
 * Fetches quiz questions from Supabase quiz_questions, falling back to local list.
 */
export async function fetchQuizQuestions() {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .order('id', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(row => {
          const letter = (row.correct_answer || 'A').toUpperCase().trim();
          const correctIdx = LETTER_TO_INDEX[letter] ?? 0;
          return {
            id: row.id,
            question: row.question,
            options: [row.option_a, row.option_b, row.option_c, row.option_d],
            correctIndex: correctIdx,
            correctAnswerLetter: letter,
            explanation: row.explanation,
            coins: row.coins || 50
          };
        });
      }
    } catch (err) {
      console.warn('Failed to fetch quiz questions from Supabase, using fallback:', err);
    }
  }

  return FALLBACK_QUIZ_QUESTIONS;
}

/**
 * Loads all past quiz attempts for the anonymous user from quiz_attempts.
 */
export async function fetchUserQuizAttempts(userId) {
  const attemptsMap = {};

  // First check local storage cache
  try {
    const local = localStorage.getItem('mom_quiz_progress');
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed.answered) {
        Object.assign(attemptsMap, parsed.answered);
      }
    }
  } catch {}

  if (isSupabaseConfigured() && supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId);

      if (!error && data) {
        data.forEach(attempt => {
          const letter = (attempt.selected_answer || 'A').toUpperCase();
          const idx = LETTER_TO_INDEX[letter] ?? 0;
          attemptsMap[attempt.question_id] = {
            selectedIndex: idx,
            selectedLetter: letter,
            isCorrect: attempt.is_correct,
            coinsEarned: attempt.coins_earned,
            persisted: true
          };
        });
      }
    } catch (err) {
      console.warn('Failed to fetch quiz attempts from Supabase:', err);
    }
  }

  return attemptsMap;
}

/**
 * Submits a quiz attempt to Supabase quiz_attempts and user_profiles.
 * Prevents multiple rewards for the same question across reloads.
 */
export async function submitQuizAttempt({ userId, questionId, selectedIndex, isCorrect, coinsAwarded = 50, currentCoins = 150 }) {
  const selectedLetter = INDEX_TO_LETTER[selectedIndex] || 'A';
  const earned = isCorrect ? coinsAwarded : 0;

  // 1. Supabase persistence
  if (isSupabaseConfigured() && supabase && userId) {
    try {
      // Check if attempt already exists in database
      const { data: existing } = await supabase
        .from('quiz_attempts')
        .select('id, is_correct, coins_earned')
        .eq('user_id', userId)
        .eq('question_id', questionId)
        .maybeSingle();

      if (existing) {
        return {
          alreadyAnswered: true,
          isCorrect: existing.is_correct,
          coinsEarned: 0
        };
      }

      // Insert new attempt
      const { error: insertError } = await supabase
        .from('quiz_attempts')
        .insert([
          {
            user_id: userId,
            question_id: questionId,
            selected_answer: selectedLetter,
            is_correct: isCorrect,
            coins_earned: earned
          }
        ]);

      if (!insertError && isCorrect) {
        await updateUserBalance(userId, currentCoins + earned, earned);
      }
    } catch (err) {
      console.warn('Error recording quiz attempt in Supabase:', err);
    }
  }

  // Update local storage backup
  try {
    const raw = localStorage.getItem('mom_quiz_progress');
    const existing = raw ? JSON.parse(raw) : { answered: {}, totalEarned: 0 };
    if (!existing.answered[questionId]) {
      existing.answered[questionId] = { selectedIndex, isCorrect, coinsEarned: earned };
      existing.totalEarned = (existing.totalEarned || 0) + earned;
      localStorage.setItem('mom_quiz_progress', JSON.stringify(existing));
    }
  } catch {}

  return {
    alreadyAnswered: false,
    isCorrect,
    coinsEarned: earned
  };
}

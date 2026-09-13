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
    coins: 25
  },
  {
    id: 'q2',
    question: 'What is the primary benefit of buying an index fund (like an S&P 500 ETF) rather than a single company stock?',
    options: [
      'Index funds are guaranteed by law to never lose money',
      'Instant diversification: you own small slices of hundreds of top companies at once',
      'Index funds never charge any management fees',
      'You get to vote on daily company board decisions'
    ],
    correctIndex: 1,
    correctAnswerLetter: 'B',
    explanation: 'Diversification protects you against single-company failures. If 1 company in 500 struggles, 499 others keep your portfolio balanced.',
    coins: 25
  },
  {
    id: 'q3',
    question: 'If an online influencer promises "Guaranteed 30% returns every month with zero risk of loss", what is the reality?',
    options: [
      'It is a life-changing deal you should invest all your savings in',
      'It is almost certainly a scam or misleading trap; high return ALWAYS entails risk',
      'It is a standard rate offered by bank checking accounts',
      'It is guaranteed by central banks'
    ],
    correctIndex: 1,
    correctAnswerLetter: 'B',
    explanation: 'The iron rule of finance: Risk and return are linked. Anyone promising high returns with "zero risk" is either hiding severe danger or running an outright scam.',
    coins: 25
  },
  {
    id: 'q4',
    question: 'What happens to cash left sitting in a 0.01% traditional checking account during 3% annual inflation?',
    options: [
      'Its dollar amount decreases directly on your screen',
      'It stays exactly the same in real purchasing power',
      'Its purchasing power steadily erodes because prices rise faster than your interest rate',
      'It automatically converts into stock shares'
    ],
    correctIndex: 2,
    correctAnswerLetter: 'C',
    explanation: 'Inflation acts like a silent tax. While your bank balance display stays the same, groceries and housing cost more, making your cash buy less over time.',
    coins: 25
  },
  {
    id: 'q5',
    question: 'During a market downturn where your index fund drops 15%, what has historically yielded the best result?',
    options: [
      'Panic-selling everything to prevent further drops',
      'Remaining patient, continuing to invest consistently (Dollar-Cost Averaging), and waiting for recovery',
      'Checking your portfolio balance every 10 minutes',
      'Maxing out high-interest credit cards to trade volatile meme tokens'
    ],
    correctIndex: 1,
    correctAnswerLetter: 'B',
    explanation: 'Paper losses only become real losses if you sell at the bottom. Historically, every major market pullback has eventually been followed by new all-time highs.',
    coins: 25
  },
  {
    id: 'q6',
    question: 'Why do financial coaches emphasize choosing funds with low expense ratios (e.g. 0.03% vs 1.50%)?',
    options: [
      'High fee funds perform 10x better on average',
      'A 1.5% annual fee can eat away over 30% to 40% of your lifetime compounding returns over 30 years',
      'Expense ratios are paid directly in cash to the IRS',
      'Funds with low fees don\'t have customer support'
    ],
    correctIndex: 1,
    correctAnswerLetter: 'B',
    explanation: 'Fees compound in reverse against you! Paying an extra 1.5% fee every year steals tens of thousands of dollars from your future compounding gains.',
    coins: 25
  },
  {
    id: 'q7',
    question: 'What is Dollar-Cost Averaging (DCA)?',
    options: [
      'Investing a fixed dollar amount at regular intervals (e.g., $50 every month) regardless of market price',
      'Taxes paid on dividend income',
      'Trying to guess the exact market bottom before buying',
      'A penalty charged by brokerages for holding cash'
    ],
    correctIndex: 0,
    correctAnswerLetter: 'A',
    explanation: 'Dollar-Cost Averaging removes market timing stress. You automatically buy more shares when prices are down, and fewer when prices are high.',
    coins: 25
  },
  {
    id: 'q8',
    question: 'What is the recommended size of an Emergency Savings Buffer before investing heavily in stocks?',
    options: [
      'Zero; put every single dollar in stocks immediately',
      '3 to 6 months of essential living expenses parked safely in a liquid high-yield account',
      '10 years of total salary in cash',
      'Whatever cash is left over after buying lottery tickets'
    ],
    correctIndex: 1,
    correctAnswerLetter: 'B',
    explanation: 'An emergency fund prevents life events (like sudden medical bills) from forcing you to sell your investments at a market loss.',
    coins: 25
  },
  {
    id: 'q9',
    question: 'What does a Beta metric of 1.5 indicate for a stock compared to the overall market (Beta = 1.0)?',
    options: [
      'The stock is 50% less volatile than the market',
      'The stock tends to swing ~50% more dramatically than the broader market',
      'The stock pays a 1.5% guaranteed dividend',
      'The stock is completely immune to market crashes'
    ],
    correctIndex: 1,
    correctAnswerLetter: 'B',
    explanation: 'Beta measures volatility. A Beta of 1.5 means if the general market drops 10%, this stock historically drops roughly ~15%.',
    coins: 25
  },
  {
    id: 'q10',
    question: 'What is DRIP (Dividend Reinvestment Plan)?',
    options: [
      'A penalty on quarterly earnings',
      'An automated setting that uses your cash dividend payouts to automatically buy more shares',
      'A method for withdrawing all your money daily',
      'A day-trading software'
    ],
    correctIndex: 1,
    correctAnswerLetter: 'B',
    explanation: 'DRIP puts compounding on autopilot! Cash dividends automatically buy fractional shares, which generate even larger future dividends.',
    coins: 25
  },
  {
    id: 'q11',
    question: 'How do Bond Funds generally differ from Stock Index Funds?',
    options: [
      'Bonds are ultra-high-risk crypto assets',
      'Bonds represent loan debt paying fixed interest, providing lower volatility and defensive balance',
      'Bonds have zero price movement ever',
      'Stocks pay guaranteed interest while bonds do not'
    ],
    correctIndex: 1,
    correctAnswerLetter: 'B',
    explanation: 'Bonds add stability and income to a portfolio, acting as a buffer when stock markets undergo temporary economic recessions.',
    coins: 25
  },
  {
    id: 'q12',
    question: 'What is the main risk of holding cryptocurrency as a first-time investor?',
    options: [
      'Crypto can experience extreme 24/7 price swings (+/- 20% in a day) and lacks traditional FDIC insurance',
      'Crypto is illegal in all 50 US states',
      'Crypto pays mandatory 50% annual dividends',
      'Crypto cannot be traded on weekends'
    ],
    correctIndex: 0,
    correctAnswerLetter: 'A',
    explanation: 'Crypto carries high volatility. Beginners win by keeping speculative crypto small (1%–5% max) while building their main base in index funds.',
    coins: 25
  },
  {
    id: 'q13',
    question: 'What does FOMO (Fear Of Missing Out) often lead beginner investors to do?',
    options: [
      'Buy speculative assets at hyped peak prices right before a correction',
      'Keep 100% of their money in a savings account',
      'Research expense ratios carefully',
      'Automate monthly index fund contributions'
    ],
    correctIndex: 0,
    correctAnswerLetter: 'A',
    explanation: 'FOMO causes investors to chase viral hype and buy at peak prices. Disciplined investors stick to their long-term plan regardless of social media trends.',
    coins: 25
  },
  {
    id: 'q14',
    question: 'What is Warren Buffett\'s famous Rule #1 of investing?',
    options: [
      'Trade as frequently as possible',
      'Never lose money (and Rule #2: Never forget Rule #1)',
      'Always invest in hype startups',
      'Sell all stocks every winter'
    ],
    correctIndex: 1,
    correctAnswerLetter: 'B',
    explanation: 'Buffett emphasizes risk management: avoiding catastrophic losses is far more important than chasing speculative gains.',
    coins: 25
  },
  {
    id: 'q15',
    question: 'What does a stock\'s P/E Ratio (Price-to-Earnings) measure?',
    options: [
      'The company\'s total debt level',
      'How much investors are paying for every $1 of actual company profit',
      'The percentage of women on the executive board',
      'The physical size of the headquarters'
    ],
    correctIndex: 1,
    correctAnswerLetter: 'B',
    explanation: 'P/E compares stock price to actual profits. A higher P/E means high future growth expectations; a lower P/E indicates conservative valuation.',
    coins: 25
  },
  {
    id: 'q16',
    question: 'What are Fractional Shares and why do they help beginners?',
    options: [
      'Illegal stock splits',
      'Buying a portion of a high-priced share with as little as $1 to $5',
      'Discount coupons for brokerage fees',
      'Shares that only pay half dividends'
    ],
    correctIndex: 1,
    correctAnswerLetter: 'B',
    explanation: 'Fractional shares let you invest exact dollar amounts (e.g. $10 into a $500 stock), making diversification affordable for anyone.',
    coins: 25
  },
  {
    id: 'q17',
    question: 'What is a High-Yield Savings Account (HYSA)?',
    options: [
      'A risky stock trading account',
      'An FDIC-insured bank account offering 10x–20x higher interest rates than traditional big banks',
      'A crypto lending wallet',
      'A tax penalty account'
    ],
    correctIndex: 1,
    correctAnswerLetter: 'B',
    explanation: 'HYSAs keep emergency savings 100% safe and FDIC-insured while generating solid interest yields compared to standard 0.01% checking accounts.',
    coins: 25
  },
  {
    id: 'q18',
    question: 'What is the proven phrase regarding market timing vs long-term holding?',
    options: [
      'Timing the market beats time in the market',
      'Time in the market beats timing the market',
      'Never hold stocks longer than 1 month',
      'Always sell when headlines predict rain'
    ],
    correctIndex: 1,
    correctAnswerLetter: 'B',
    explanation: 'Decades of financial data show that staying invested long-term beats trying to guess short-term price highs and lows.',
    coins: 25
  },
  {
    id: 'q19',
    question: 'What is a Stock Dividend?',
    options: [
      'A tax refund from the government',
      'A portion of company profits distributed directly to shareholders in cash',
      'A loan taken out by the investor',
      'A fine charged for selling shares early'
    ],
    correctIndex: 1,
    correctAnswerLetter: 'B',
    explanation: 'Dividends reward shareholders with cash flow. Reinvesting them accelerates wealth creation through compounding.',
    coins: 25
  },
  {
    id: 'q20',
    question: 'What is the difference between an Unrealized (Paper) Loss and a Realized Loss?',
    options: [
      'Unrealized loss is cash already gone, realized loss is temporary',
      'Unrealized loss is a temporary drop in account value on screen; Realized loss happens only when you actually sell',
      'Both mean you lost cash forever immediately',
      'Realized loss is paid by your insurance company'
    ],
    correctIndex: 1,
    correctAnswerLetter: 'B',
    explanation: 'If price drops while you still own the asset, it is an unrealized paper drop. You only lock in an actual loss if you panic-sell at the bottom.',
    coins: 25
  }
];

const LETTER_TO_INDEX = { A: 0, B: 1, C: 2, D: 3 };
const INDEX_TO_LETTER = ['A', 'B', 'C', 'D'];

const getQuizKey = (userId) => `mom_quiz_progress_${userId || 'guest'}`;

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
            coins: row.coins || 25
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
 * Loads all past quiz attempts for the user from quiz_attempts & user-scoped storage.
 */
export async function fetchUserQuizAttempts(userId) {
  const attemptsMap = {};

  try {
    const local = localStorage.getItem(getQuizKey(userId));
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
 */
export async function submitQuizAttempt({ userId, questionId, selectedIndex, isCorrect, coinsAwarded = 25, currentCoins = 100 }) {
  const selectedLetter = INDEX_TO_LETTER[selectedIndex] || 'A';
  const earned = isCorrect ? coinsAwarded : 0;

  if (isSupabaseConfigured() && supabase && userId) {
    try {
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

  try {
    const key = getQuizKey(userId);
    const raw = localStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : { answered: {}, totalEarned: 0 };
    if (!existing.answered[questionId]) {
      existing.answered[questionId] = { selectedIndex, isCorrect, coinsEarned: earned };
      existing.totalEarned = (existing.totalEarned || 0) + earned;
      localStorage.setItem(key, JSON.stringify(existing));
    }
  } catch {}

  return {
    alreadyAnswered: false,
    isCorrect,
    coinsEarned: earned
  };
}

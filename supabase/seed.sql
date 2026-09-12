-- ==============================================================================
-- MIND OVER MONEY - Supabase Initial Seed Data
-- ==============================================================================

-- 1. SEED ASSETS
INSERT INTO public.assets (id, name, category, symbol, price, volatility, sector, description, risk_level, is_beginner_friendly, extra_data)
VALUES
(
    'vanguard-sp500-etf',
    'Vanguard S&P 500 ETF',
    'mutual_fund',
    'VOO',
    512.45,
    13.2,
    'Broad Market Index',
    'Owns a tiny slice of 500 of America''s largest and most profitable companies, like Apple, Microsoft, and Amazon. The gold standard for beginner diversification.',
    'Low',
    true,
    '{
        "volatilityMetric": { "beta": 1.0, "annualizedVolatility": 13.2, "maxDrawdown": -23.9 },
        "metrics": {
            "expenseRatio": "0.03% ($3 per $10,000/yr)",
            "marketCap": "$1.1 Trillion",
            "dividendYield": "1.38%",
            "peRatio": "26.4",
            "historicalReturns": { "1yr": "+24.8%", "3yr": "+33.5%", "5yr": "+87.2%" },
            "simulationMonthlyReturns": [1.4, -0.8, 2.1, 1.2, -1.5, 3.2, 0.9, -0.4, 2.3, 1.8, -1.1, 2.6]
        },
        "plainEnglishJargon": [
            { "term": "Expense Ratio (0.03%)", "definition": "The annual management fee taken out automatically by the fund manager.", "whyItMatters": "0.03% is ultra-low! It means almost 99.97% of your earnings stay in your pocket." },
            { "term": "Beta (1.00)", "definition": "A baseline measure of how much an asset bounces around compared to the overall market.", "whyItMatters": "A Beta of 1.0 means this fund IS the market benchmark." }
        ],
        "suggestedQuestions": [
            "Why do so many financial experts recommend this for complete beginners?",
            "What happens if the stock market crashes while I own this?",
            "What does an expense ratio of 0.03% actually cost me in real dollars?",
            "How does this ETF pay me money (dividends vs growth)?"
        ]
    }'::jsonb
),
(
    'vanguard-total-bond-etf',
    'Vanguard Total Bond Market ETF',
    'mutual_fund',
    'BND',
    73.15,
    5.8,
    'Fixed Income / US Bonds',
    'Loans money to the US government and top corporations in exchange for steady interest payments. Built for safety and capital preservation.',
    'Low',
    true,
    '{
        "volatilityMetric": { "beta": 0.22, "annualizedVolatility": 5.8, "maxDrawdown": -13.1 },
        "metrics": {
            "expenseRatio": "0.03%",
            "marketCap": "$310 Billion",
            "dividendYield": "4.45%",
            "peRatio": "N/A (Bond Fund)",
            "historicalReturns": { "1yr": "+6.4%", "3yr": "-1.2%", "5yr": "+4.1%" },
            "simulationMonthlyReturns": [0.4, 0.3, 0.2, 0.5, -0.1, 0.3, 0.4, 0.2, -0.2, 0.4, 0.3, 0.5]
        },
        "plainEnglishJargon": [
            { "term": "Bond Yield (4.45%)", "definition": "The interest percentage paid annually to you for loaning your money.", "whyItMatters": "Predictable cash flow that cushions your portfolio when stocks swing." }
        ],
        "suggestedQuestions": [
            "How are bonds different from buying individual stocks?",
            "Is my money guaranteed or can bonds lose value?",
            "Why should a beginner hold bonds if stocks grow faster?",
            "How do interest rate changes affect this fund?"
        ]
    }'::jsonb
),
(
    'apple-inc',
    'Apple Inc.',
    'stock',
    'AAPL',
    228.60,
    19.4,
    'Consumer Electronics & Services',
    'The world''s most recognizable consumer technology brand, producing the iPhone, Mac, wearables, and high-margin subscription services.',
    'Medium',
    true,
    '{
        "volatilityMetric": { "beta": 1.08, "annualizedVolatility": 19.4, "maxDrawdown": -31.2 },
        "metrics": {
            "peRatio": "33.8",
            "marketCap": "$3.48 Trillion",
            "dividendYield": "0.44%",
            "expenseRatio": "0.00% (Direct Stock)",
            "historicalReturns": { "1yr": "+28.1%", "3yr": "+52.3%", "5yr": "+210.4%" },
            "simulationMonthlyReturns": [2.5, -1.8, 3.4, 1.1, -2.4, 4.1, 0.8, -1.2, 3.1, 2.0, -0.9, 3.8]
        },
        "plainEnglishJargon": [
            { "term": "P/E Ratio (33.8)", "definition": "Price-to-Earnings: How much investors pay for every $1 of corporate profit.", "whyItMatters": "Indicates high growth expectations from investors." }
        ],
        "suggestedQuestions": [
            "Is buying Apple stock better than buying an S&P 500 index fund?",
            "What is a P/E ratio and why is Apple''s considered high?",
            "What risks should I watch out for before buying Apple?",
            "Does Apple pay dividends to shareholders?"
        ]
    }'::jsonb
),
(
    'microsoft-corp',
    'Microsoft Corporation',
    'stock',
    'MSFT',
    422.30,
    20.1,
    'Enterprise Software & Cloud AI',
    'Dominates enterprise computing through Azure Cloud, Office 365, Windows, and cutting-edge artificial intelligence infrastructure.',
    'Medium',
    true,
    '{
        "volatilityMetric": { "beta": 1.12, "annualizedVolatility": 20.1, "maxDrawdown": -29.5 },
        "metrics": {
            "peRatio": "35.2",
            "marketCap": "$3.14 Trillion",
            "dividendYield": "0.76%",
            "expenseRatio": "0.00%",
            "historicalReturns": { "1yr": "+22.5%", "3yr": "+48.9%", "5yr": "+195.0%" },
            "simulationMonthlyReturns": [1.9, -1.2, 2.8, 1.4, -1.8, 3.5, 0.5, -0.7, 2.9, 1.6, -1.4, 3.1]
        },
        "plainEnglishJargon": [
            { "term": "Cloud Revenue", "definition": "Recurring subscription income from enterprise cloud infrastructure.", "whyItMatters": "Provides predictable financial cash flows through recessions." }
        ],
        "suggestedQuestions": [
            "What gives Microsoft a competitive moat against rivals?",
            "Why is Microsoft considered a cornerstone tech investment?",
            "How volatile is Microsoft compared to the broader market?",
            "Should I buy Microsoft for dividends or capital growth?"
        ]
    }'::jsonb
),
(
    'bitcoin',
    'Bitcoin',
    'crypto',
    'BTC',
    64500.00,
    68.4,
    'Decentralized Digital Currency',
    'The first and largest decentralized digital asset. Operates without central banks with a mathematical supply cap of 21 million coins.',
    'High',
    false,
    '{
        "volatilityMetric": { "beta": 2.45, "annualizedVolatility": 68.4, "maxDrawdown": -77.2 },
        "metrics": {
            "peRatio": "N/A (Commodity/Currency)",
            "marketCap": "$1.27 Trillion",
            "dividendYield": "0.00%",
            "expenseRatio": "0.00%",
            "historicalReturns": { "1yr": "+128.0%", "3yr": "+45.0%", "5yr": "+480.0%" },
            "simulationMonthlyReturns": [12.4, -14.2, 18.1, -8.5, 22.0, -16.4, 9.2, -11.0, 15.3, 8.1, -12.5, 14.8]
        },
        "plainEnglishJargon": [
            { "term": "Decentralization", "definition": "No single company, bank, or government controls the network.", "whyItMatters": "Gives complete ownership, but transactions cannot be reversed by customer service." }
        ],
        "suggestedQuestions": [
            "Is Bitcoin considered an investment, digital gold, or speculation for beginners?",
            "What percentage of my portfolio is prudent for crypto?",
            "What causes Bitcoin''s extreme 70%+ drawdowns?",
            "Where do people store Bitcoin safely?"
        ]
    }'::jsonb
),
(
    'ethereum',
    'Ethereum',
    'crypto',
    'ETH',
    2480.00,
    74.2,
    'Smart Contract Platform',
    'A global decentralized software platform allowing developers to create programmable smart contracts and decentralized finance (DeFi).',
    'High',
    false,
    '{
        "volatilityMetric": { "beta": 2.60, "annualizedVolatility": 74.2, "maxDrawdown": -82.1 },
        "metrics": {
            "peRatio": "N/A",
            "marketCap": "$298 Billion",
            "dividendYield": "3.10% (Staking APY)",
            "expenseRatio": "0.00%",
            "historicalReturns": { "1yr": "+62.0%", "3yr": "-15.4%", "5yr": "+820.0%" },
            "simulationMonthlyReturns": [14.1, -16.8, 21.0, -10.2, 25.4, -19.1, 11.0, -13.2, 18.5, 9.4, -15.0, 16.2]
        },
        "plainEnglishJargon": [
            { "term": "Smart Contracts", "definition": "Self-executing code stored on the blockchain that triggers automatically.", "whyItMatters": "Powers modern Web3 apps without human middlemen." }
        ],
        "suggestedQuestions": [
            "How is Ethereum different from Bitcoin?",
            "What does staking ETH mean and is it risk-free?",
            "Why is Ethereum''s volatility higher than the stock market?",
            "What are gas fees in plain English?"
        ]
    }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    volatility = EXCLUDED.volatility,
    description = EXCLUDED.description,
    risk_level = EXCLUDED.risk_level,
    extra_data = EXCLUDED.extra_data;

-- 2. SEED QUIZ QUESTIONS
INSERT INTO public.quiz_questions (id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, coins)
VALUES
(
    'q1',
    'Why is starting to invest early often more powerful than waiting to invest larger sums later?',
    'The government gives bonuses to younger investors',
    'Compound interest allows your earnings to earn their own earnings over decades',
    'Stock prices are cheaper in your 20s than your 40s',
    'Older investors are legally restricted from high-growth funds',
    'B',
    'Compound interest acts like a snowball. Given 20–30 years, the majority of your wealth comes from compound returns on your gains, not the original dollars you deposited!',
    50
),
(
    'q2',
    'What is the primary benefit of buying an index fund (like an S&P 500 ETF) rather than an individual stock?',
    'Index funds are guaranteed by law to never lose money',
    'Instant diversification: you own slices of hundreds of companies so one failure doesn''t ruin you',
    'Index funds never charge any fees or expenses',
    'You get to vote on daily company board decisions',
    'B',
    'Diversification protects you against catastrophic single-company collapse. If 1 company in 500 struggles, 499 others keep your portfolio balanced.',
    50
),
(
    'q3',
    'If an investment sponsor promises "30% guaranteed returns every year with zero risk of loss", what is the reality?',
    'It is an exceptional opportunity you should invest all your savings in',
    'It is almost certainly a scam or misleading marketing; high return always entails risk',
    'It is a standard high-yield savings account rate',
    'It is guaranteed by central banks',
    'B',
    'The fundamental iron rule of finance: Risk and return are inextricably linked. Anyone offering high returns with "zero risk" is either hiding severe danger or running an outright scam.',
    50
),
(
    'q4',
    'What happens to cash left sitting in a 0.01% checking account over 10 years during periods of 3% inflation?',
    'Its dollar amount decreases directly',
    'It stays exactly the same in terms of purchasing power',
    'Its purchasing power steadily erodes because prices rise faster than your interest',
    'It automatically converts into stock shares',
    'C',
    'While the dollar balance on your bank app looks unchanged, inflation makes groceries and housing more expensive. After 10 years at 3% inflation, $10,000 only buys what ~$7,400 buys today.',
    50
),
(
    'q5',
    'During a market downturn where your portfolio drops 20%, what has historically produced the best long-term outcome for index investors?',
    'Panic-selling everything immediately to prevent further drops',
    'Remaining patient, continuing to invest consistently (dollar-cost averaging), and waiting for recovery',
    'Checking your portfolio balance every 10 minutes',
    'Borrowing maximum credit card debt to trade volatile meme coins',
    'B',
    'Paper losses are only locked in when you sell at the bottom. Historically, every major bear market and recession in modern history has eventually been followed by new all-time highs for diversified broad market indices.',
    50
),
(
    'q6',
    'Why do financial advisors emphasize looking for low expense ratios (e.g. 0.03% vs 1.50%) on funds?',
    'High fee funds perform 10x better on average',
    'A 1.5% annual fee can eat away over 30% to 40% of your total lifetime nest egg over 30 years',
    'Expense ratios are paid directly in cash to the IRS',
    'Funds with low fees don''t have customer support',
    'B',
    'Fees compound in reverse against you! Over 30 years, paying an extra 1.5% every year subtracts hundreds of thousands in missed compound growth.',
    50
)
ON CONFLICT (id) DO UPDATE SET
    question = EXCLUDED.question,
    option_a = EXCLUDED.option_a,
    option_b = EXCLUDED.option_b,
    option_c = EXCLUDED.option_c,
    option_d = EXCLUDED.option_d,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    coins = EXCLUDED.coins;

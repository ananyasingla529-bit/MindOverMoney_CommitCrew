/**
 * AI Service for Mind Over Money
 * Strictly scoped to financial literacy & asset-specific coaching.
 * All live LLM API calls are routed through the backend /api/chat proxy.
 * Never exposes API keys client-side.
 */

const OFF_TOPIC_KEYWORDS = [
  'weather', 'recipe', 'movie', 'song', 'sports', 'football', 'basketball',
  'python', 'javascript', 'coding', 'html', 'write code', 'president',
  'politics', 'election', 'dating', 'medical advice', 'doctor', 'game'
];

export function isOffTopic(question) {
  const q = question.toLowerCase();
  const financeKeywords = [
    'invest', 'stock', 'crypto', 'bond', 'fund', 'etf', 'risk', 'money', 
    'yield', 'dividend', 'buy', 'sell', 'loss', 'gain', 'market', 'crash', 
    'safe', 'fee', 'expense', 'beta', 'p/e', 'portfolio'
  ];
  const hasFinance = financeKeywords.some(w => q.includes(w));
  if (hasFinance) return false;

  return OFF_TOPIC_KEYWORDS.some(kw => q.includes(kw));
}

export async function askAssetCoach({ asset, question, history = [], apiKey = null }) {
  const currentAsset = asset || {
    name: 'General Finance & Investing',
    symbol: 'FINANCE',
    category: 'general',
    sector: 'Financial Literacy',
    price: 0,
    riskLevel: 'Low',
    shortDescription: 'General investing concepts, risk, diversification, and market literacy.'
  };

  // Guardrail 1: Scope check
  if (isOffTopic(question)) {
    return {
      text: `👋 I am your **Mind Over Money AI Coach**, designed specifically to help first-time investors learn investing principles, evaluate risks, and understand financial terms.\n\nI focus strictly on financial literacy, market concepts, asset comparison, and risk management. Please ask a financial question!`,
      isFallback: true,
      scopedRefusal: true,
    };
  }

  // Guardrail 2: Call backend server-side proxy /api/chat if available
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        asset: {
          name: currentAsset.name,
          symbol: currentAsset.symbol,
          category: currentAsset.category,
          sector: currentAsset.sector,
          price: currentAsset.price,
          riskLevel: currentAsset.riskLevel,
          volatilityMetric: currentAsset.volatilityMetric,
          metrics: currentAsset.metrics,
          shortDescription: currentAsset.shortDescription
        },
        question,
        apiKey
      }),
      signal: controller.signal
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (res && res.ok) {
      const data = await res.json();
      if (data && data.text) {
        return {
          text: data.text,
          isFallback: Boolean(data.isFallback)
        };
      }
    }
  } catch (err) {
    console.info('Server-side AI proxy skipped, switching to built-in fallback tutor:', err);
  }

  // High-fidelity contextual fallback engine
  const fallbackReply = generateSmartFallbackReply(currentAsset, question);
  return {
    text: fallbackReply,
    isFallback: true
  };
}

/**
 * Intelligent contextual fallback response generator.
 * Analyzes question intent and crafts asset-specific or general financial guidance.
 */
export function generateSmartFallbackReply(asset, question) {
  const q = question.toLowerCase();
  const isBeginnerFriendly = asset.beginnerFriendly ?? true;
  const risk = asset.riskLevel || 'Low';
  const beta = asset.volatilityMetric?.beta ?? (asset.volatility > 20 ? 1.5 : 0.85);
  const vol = asset.volatilityMetric?.annualizedVolatility ?? asset.volatility ?? 15;
  const category = asset.category || 'general';

  // General beginner advice
  if (q.includes('how to start') || q.includes('how do i start') || q.includes('first step') || q.includes('where to begin')) {
    return `**Starting Your Financial Journey as a First-Time Investor:**\n\n1. **Build an Emergency Cushion**: Save 3 to 6 months of essential living expenses in a liquid high-yield savings account before investing.\n2. **Start Small & Consistent**: Begin with low-cost broad index funds (like VOO or VTI). Investing $50–$100 monthly builds habits without emotional stress.\n3. **Think Long-Term**: Real wealth is built by holding quality assets for 5–10+ years, allowing compound interest to work for you.`;
  }

  if (q.includes('what is risk') || q.includes('volatility') || q.includes('beta')) {
    return `**Understanding Investment Risk & Volatility:**\n\n- **Volatility**: Measures how wildly an asset's price bounces up and down.\n- **Beta Metric**: A Beta of 1.0 matches the average stock market swing. Beta < 1.0 (e.g. 0.85) is calmer and safer; Beta > 1.0 (e.g. 1.5) moves much faster.\n- **Golden Rule**: Never invest short-term emergency money in high-beta or high-volatility assets!`;
  }

  // 1. Beginner suitability
  if (q.includes('beginner') || q.includes('safe') || q.includes('start') || q.includes('should i buy') || q.includes('good for me')) {
    if (isBeginnerFriendly) {
      return `**Yes, ${asset.name} is well-suited for beginners.**\n\nHere is why:\n- **Calm Risk Profile**: It is rated **${risk} Risk** with a Beta of **${beta}**, meaning it doesn't fluctuate wildly compared to speculative assets.\n- **Built-in Diversification**: Rather than betting on a single startup, you are backing proven market leaders.\n- **Rule of Thumb**: As a first-time investor, start with small, consistent dollar amounts (called *dollar-cost averaging*) to get comfortable watching your balance move naturally.`;
    } else {
      return `⚠️ **Approach ${asset.name} with caution if you are an absolute beginner.**\n\n- **Risk Rating**: This asset is classified as **${risk} Risk** with an annualized volatility of **${vol}%** (Beta: ${beta}).\n- **Emotional Reality**: In a market downturn, this asset has historically experienced drops up to **${asset.volatilityMetric?.maxDrawdown || '-40%'}**. If seeing a $100 investment drop to $60 would make you panic and sell, start with an index fund (like VOO) or bond fund first.\n- **Prudent Tip**: If you do invest, limit it to **no more than 5%** of your total portfolio as "fun / learning money".`;
    }
  }

  // 2. Crash or market drop reaction
  if (q.includes('crash') || q.includes('drop') || q.includes('bear market') || q.includes('lose money') || q.includes('down')) {
    return `If the broader market crashes, here is what to expect with **${asset.symbol}**:\n\n1. **Expected Drop**: With a Beta of **${beta}**, when the market drops 10%, ${asset.name} historically moves roughly **${(beta * 10).toFixed(1)}%**.\n2. **Paper Loss vs Realized Loss**: A drop on screen is only an "unrealized paper loss." You only lock in a loss if you panic-sell at the bottom.\n3. **Historical Perspective**: Strong assets have historically recovered over 3–5+ year horizons. First-time investors win by keeping their emotions calm and remembering their long-term time horizon.`;
  }

  // 3. Expense ratio & fees
  if (q.includes('expense') || q.includes('fee') || q.includes('cost') || q.includes('hidden')) {
    const expense = asset.metrics?.expenseRatio || '0.00%';
    if (category === 'mutual_fund') {
      return `**Expense Ratio for ${asset.symbol}: ${expense}**\n\n- **What it means**: This is the annual management fee taken automatically out of the fund's returns.\n- **In plain dollars**: An expense ratio like ${expense} means you pay only pennies per year per $1,000 invested.\n- **Why it matters**: High mutual fund fees (like 1.5%+) eat away tens of thousands in compound interest over 30 years. Low-cost funds like this keep nearly 100% of your compounding gains in your pocket!`;
    } else {
      return `**No Ongoing Expense Ratio**: Because ${asset.name} is a direct ${category}, there is no ongoing fund management fee (0.00% expense ratio). You only pay whatever small trading fee or spread your brokerage charges when buying or selling.`;
    }
  }

  // 4. Dividends & cash flow
  if (q.includes('dividend') || q.includes('income') || q.includes('payout') || q.includes('cash')) {
    const div = asset.metrics?.dividendYield || '0.00%';
    if (parseFloat(div) > 0) {
      return `**Dividend Yield for ${asset.symbol}: ${div}**\n\n- **How it works**: Companies share a portion of their profits directly with you in cash, typically every quarter.\n- **The Secret Weapon**: As a first-time investor, turn on **DRIP (Dividend Reinvestment Plan)** in your brokerage. Your dividend payouts will automatically buy fractional shares, supercharging your compound interest over time!`;
    } else {
      return `**${asset.name} currently pays no regular dividend (${div}).**\n\nInstead of paying out quarterly cash, the company reinvests 100% of its cash back into research, hiring, and expansion. Your profit comes entirely from **capital appreciation** (the share price rising over time).`;
    }
  }

  // 5. Crypto specific
  if (category === 'crypto' || q.includes('crypto') || q.includes('bitcoin') || q.includes('blockchain')) {
    return `**Understanding Crypto as a Beginner with ${asset.name}:**\n\n- **High Growth Potential & High Volatility**: Crypto operates 24/7/365 globally. Swings of +/- 10% in a single day are common.\n- **Self-Custody vs Exchange**: Unlike traditional bank accounts insured by the FDIC, cryptocurrency transactions are irreversible.\n- **Coach Recommendation**: Treat crypto as an exciting satellite investment (1% to 5% max), while keeping your core financial foundation in diversified index funds and an emergency savings cushion.`;
  }

  // Default contextual response
  return `**Analyzing ${asset.name} (${asset.symbol}) for First-Time Investors:**\n\n- **Classification**: ${category.toUpperCase()} in the **${asset.sector}** sector.\n- **Risk Profile**: **${risk} Risk** (Beta: ${beta}, Volatility: ${vol}%).\n- **Core Purpose**: ${asset.shortDescription}\n- **Investor Advice**: When building your first investment portfolio, balance higher-risk growth assets with defensive, steady index funds. Keep a horizon of at least 3–5 years so short-term fluctuations don't shake your financial plan!`;
}

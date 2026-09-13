/**
 * AI Service for Mind Over Money
 * Strictly scoped to financial literacy & asset-specific coaching.
 * Supports direct client-side Gemini API calls, server proxy, or high-fidelity smart tutor engine.
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
    'safe', 'fee', 'expense', 'beta', 'p/e', 'portfolio', 'dollar', '100'
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

  // Guardrail 2: Direct Gemini API Call if apiKey is provided
  if (apiKey) {
    try {
      const prompt = `You are Mind Over Money AI Coach, an empathetic, jargon-free investing mentor for first-time investors.
Topic Focus: ${currentAsset.name} (${currentAsset.symbol})
Category: ${currentAsset.category}
Sector: ${currentAsset.sector}
Risk Profile: ${currentAsset.riskLevel}

User Question: "${question}"

Strict Instructions:
1. Provide a direct, helpful, real-time answer to the user's specific question.
2. Explain clearly in plain, friendly English at an 8th-grade reading level.
3. Keep the response concise, encouraging, and structured with bold highlights.`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 400 }
          })
        }
      ).catch(() => null);

      if (geminiRes && geminiRes.ok) {
        const data = await geminiRes.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return {
            text: reply,
            isFallback: false
          };
        }
      }
    } catch (err) {
      console.info('Direct Gemini API call error, using smart tutor fallback:', err);
    }
  }

  // Guardrail 3: Try backend proxy endpoint /api/chat
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        asset: currentAsset,
        question,
        apiKey
      }),
      signal: controller.signal
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (res && res.ok) {
      const data = await res.json();
      if (data && data.text && !data.isFallback) {
        return {
          text: data.text,
          isFallback: false
        };
      }
    }
  } catch (err) {
    console.info('Server proxy skipped');
  }

  // Guardrail 4: Intelligent Dynamic Contextual Fallback Response Engine
  const fallbackReply = generateSmartFallbackReply(currentAsset, question);
  return {
    text: fallbackReply,
    isFallback: true
  };
}

/**
 * Intelligent contextual fallback response generator.
 * Analyzes question intent dynamically to craft asset-specific or general financial guidance.
 */
export function generateSmartFallbackReply(asset, question) {
  const q = question.toLowerCase();
  const isBeginnerFriendly = asset.beginnerFriendly ?? true;
  const risk = asset.riskLevel || 'Low';
  const beta = asset.volatilityMetric?.beta ?? (asset.volatility > 20 ? 1.5 : 0.85);
  const vol = asset.volatilityMetric?.annualizedVolatility ?? asset.volatility ?? 15;
  const category = asset.category || 'general';

  // 1. How to start investing / $100 / first steps
  if (q.includes('100') || q.includes('how to start') || q.includes('how do i start') || q.includes('first step') || q.includes('where to begin')) {
    return `**Starting Your Investment Journey with $100:**\n\n1. **Choose a Low-Cost Index Fund or ETF**: Broad funds (like VOO or VTI) allow you to buy fractional shares with as little as $1 to $5.\n2. **Practice Dollar-Cost Averaging**: Rather than waiting to save thousands, invest $25–$50 consistently every month. This removes emotional market timing.\n3. **Keep Emergency Cash Separate**: Ensure your rent and bill money sits safely in a bank high-yield savings account before investing.\n\n💡 **Tip**: Fractional shares mean your $100 immediately spreads across hundreds of top companies!`;
  }

  // 2. Stocks vs ETFs vs Crypto
  if (q.includes('difference') || q.includes('etf') || q.includes('crypto') || q.includes('stocks vs')) {
    return `**Key Differences for Beginners:**\n\n- 📊 **Individual Stocks**: You buy ownership in ONE specific company (e.g. Apple). High growth potential, but higher risk if that single company faces trouble.\n- 🏛️ **ETFs / Index Funds**: You buy a basket containing hundreds of companies at once. Built-in instant diversification and lower risk!\n- ⚡ **Crypto**: Digital, 24/7 decentralized assets. High potential returns, but extreme price swings (+/- 15% in a single day).\n\n💡 **Rule of Thumb**: Build your foundation with 80%+ in index funds/ETFs, and limit individual stocks or crypto to under 10–20%.`;
  }

  // 3. Risk level & Beta metric
  if (q.includes('risk') || q.includes('beta') || q.includes('volatility')) {
    return `**Understanding Risk & Beta:**\n\n- **Risk Level for ${asset.name}**: Classified as **${risk} Risk**.\n- **Beta Metric (${beta})**: A Beta of 1.0 moves in sync with the overall market. Beta < 1.0 (e.g. 0.85) moves slower and calmer; Beta > 1.0 (e.g. 1.5) swings faster.\n- **Annualized Volatility**: **${vol}%**. Higher volatility means larger price swings. Match high volatility assets with longer holding timeframes (5+ years)!`;
  }

  // 4. Emergency fund
  if (q.includes('emergency') || q.includes('buffer') || q.includes('savings')) {
    return `**Why You Need an Emergency Cushion First:**\n\n- **The Rule**: Save **3 to 6 months of essential living expenses** in a high-yield savings account BEFORE investing heavily in stocks.\n- **Why it matters**: If a market downturn happens and an unexpected car repair arises, an emergency fund prevents you from being forced to sell your stocks at a loss!`;
  }

  // 5. Beginner safety for specific asset
  if (q.includes('beginner') || q.includes('safe') || q.includes('good for me')) {
    if (isBeginnerFriendly) {
      return `**Yes, ${asset.name} is well-suited for first-time investors.**\n\n- **Calm Risk Profile**: Rated **${risk} Risk** (Beta: ${beta}).\n- **Diversification**: Backed by established earnings rather than speculative hype.\n- **Advice**: Start with modest, automated monthly buys to get comfortable with normal price fluctuations.`;
    } else {
      return `⚠️ **Approach ${asset.name} with caution as a beginner.**\n\n- **Risk Rating**: **${risk} Risk** with ${vol}% annual volatility.\n- **Emotional Reality**: High volatility assets require strong emotional discipline during drawdowns.\n- **Advice**: Keep high-risk assets to no more than 5% of your total portfolio while building your core in broad index funds.`;
    }
  }

  // 6. Dividends & Cash Flow
  if (q.includes('dividend') || q.includes('income') || q.includes('payout')) {
    const div = asset.metrics?.dividendYield || '0.00%';
    return `**Dividends & Income for ${asset.name}:**\n\n- **Dividend Yield**: ${div}\n- **How it works**: Companies distribute a portion of their profits in cash to shareholders quarterly.\n- **DRIP Secret**: Reinvesting dividends automatically buys more shares, compounding your total portfolio growth over time!`;
  }

  // 7. Market Crash
  if (q.includes('crash') || q.includes('drop') || q.includes('down') || q.includes('bear')) {
    return `**What to Do in a Market Crash:**\n\n1. **Unrealized vs Realized**: A drop in account balance is just a paper loss. You only lock in a loss if you panic-sell.\n2. **Historical Recovery**: The broader market has recovered from 100% of historical crashes over 3 to 5-year periods.\n3. **Strategy**: Stay calm, stick to your long-term plan, and treat market dips as sales on quality assets.`;
  }

  // Generic intelligent response
  return `**Insight for ${asset.name} (${asset.symbol}):**\n\n- **Category**: ${category.toUpperCase()} (${asset.sector})\n- **Risk Profile**: **${risk} Risk** (Beta: ${beta}, Volatility: ${vol}%)\n- **Overview**: ${asset.shortDescription}\n\n💡 **Investor Key Takeaway**: Build your core financial foundation with diversified assets, maintain a 3–5+ year horizon, and never invest money you might need for short-term bills!`;
}

import sampleAssets from '../data/sampleAssets.json';
import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Transparent, rule-based risk calculation.
 * Computes risk strictly based on asset category, beta, and annualized volatility.
 * Not a black box!
 */
export function calculateRiskLevel(asset) {
  const category = asset.category?.toLowerCase();
  const beta = asset.volatilityMetric?.beta ?? (asset.volatility > 20 ? 1.5 : 0.85);
  const vol = asset.volatilityMetric?.annualizedVolatility ?? asset.volatility ?? 15;

  if (category === 'crypto') {
    return {
      level: 'High',
      color: 'rose',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      reason: 'Cryptocurrency assets experience high 24/7 price swings, unregulated liquidity, and historical drawdowns exceeding 70%.'
    };
  }

  if (beta > 1.4 || vol > 35) {
    return {
      level: 'High',
      color: 'rose',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      reason: `High volatility asset with Beta (${beta.toFixed(2)} > 1.40) or 1-year volatility (${vol}% > 35%). Price swings significantly exceed broader market averages.`
    };
  }

  if (beta >= 0.85 || vol > 15) {
    return {
      level: 'Medium',
      color: 'amber',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      reason: `Moderate volatility with Beta (${beta.toFixed(2)}) near market standard (0.85 - 1.40) and volatility (${vol}%). Expect normal market fluctuations.`
    };
  }

  return {
    level: 'Low',
    color: 'emerald',
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    reason: `Calm, defensive asset with Beta (${beta.toFixed(2)} < 0.85) and annualized volatility (${vol}% <= 15%). Less prone to sudden market downturns.`
  };
}

/**
 * Loads assets from Supabase database `assets` table.
 * Falls back gracefully to `sampleAssets.json` if Supabase is offline or unseeded.
 */
export async function getAssets() {
  let assetList = null;

  // 1. Try querying Supabase assets table
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('id');

      if (!error && data && data.length > 0) {
        assetList = data.map(row => {
          const extra = row.extra_data || {};
          const volMetric = extra.volatilityMetric || {
            beta: row.volatility > 30 ? 1.6 : row.volatility > 15 ? 1.0 : 0.6,
            annualizedVolatility: parseFloat(row.volatility),
            maxDrawdown: -25
          };

          return {
            id: row.id,
            name: row.name,
            category: row.category,
            symbol: row.symbol,
            price: parseFloat(row.price),
            change24h: extra.change24h ?? 0.5,
            sector: row.sector,
            shortDescription: row.description,
            beginnerFriendly: Boolean(row.is_beginner_friendly),
            volatility: parseFloat(row.volatility),
            volatilityMetric: volMetric,
            riskLevel: row.risk_level || 'Medium',
            metrics: extra.metrics || {
              expenseRatio: '0.00%',
              marketCap: '$100 Billion',
              dividendYield: '1.5%',
              historicalReturns: { "1yr": "+15.0%", "3yr": "+25.0%", "5yr": "+60.0%" }
            },
            plainEnglishJargon: extra.plainEnglishJargon || [
              {
                term: "Volatility (" + row.volatility + "%)",
                definition: "The degree of variation of a trading price series over time.",
                whyItMatters: "Higher volatility means larger potential price swings."
              }
            ],
            suggestedQuestions: extra.suggestedQuestions || [
              `Is ${row.symbol} safe for an absolute beginner?`,
              `What happens if the market crashes while I own this?`,
              `How does this asset make money?`,
              `What is a safe allocation percentage for this asset?`
            ]
          };
        });
      }
    } catch (err) {
      console.warn('Supabase assets query failed, switching to local dataset fallback:', err);
    }
  }

  // 2. If Supabase is unseeded or offline, use sampleAssets.json
  if (!assetList || assetList.length === 0) {
    assetList = sampleAssets;
  }

  // 3. Attempt server-side market data proxy (/api/market) for live price updates
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const res = await fetch('/api/market', { signal: controller.signal }).catch(() => null);
    clearTimeout(timeoutId);

    if (res && res.ok) {
      const marketData = await res.json();
      if (marketData && marketData.prices) {
        assetList = assetList.map(asset => {
          if (marketData.prices[asset.id]) {
            return {
              ...asset,
              price: marketData.prices[asset.id].price ?? asset.price,
              change24h: marketData.prices[asset.id].change24h ?? asset.change24h
            };
          }
          return asset;
        });
      }
    }
  } catch {}

  return assetList;
}

export async function getAssetById(id) {
  const assets = await getAssets();
  return assets.find(a => a.id === id) || null;
}

export function filterAndSortAssets(assets, { category = 'all', riskLevel = 'all', search = '', beginnerOnly = false, sortBy = 'recommended' }) {
  let filtered = [...assets];

  // Category filter
  if (category && category !== 'all') {
    filtered = filtered.filter(a => a.category === category);
  }

  // Risk filter
  if (riskLevel && riskLevel !== 'all') {
    filtered = filtered.filter(a => a.riskLevel.toLowerCase() === riskLevel.toLowerCase());
  }

  // Beginner only filter
  if (beginnerOnly) {
    filtered = filtered.filter(a => a.beginnerFriendly === true);
  }

  // Search filter
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.symbol.toLowerCase().includes(q) ||
      a.sector.toLowerCase().includes(q) ||
      a.shortDescription.toLowerCase().includes(q)
    );
  }

  // Sorting
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'volatility-asc':
        return a.volatilityMetric.annualizedVolatility - b.volatilityMetric.annualizedVolatility;
      case 'volatility-desc':
        return b.volatilityMetric.annualizedVolatility - a.volatilityMetric.annualizedVolatility;
      case 'change-desc':
        return b.change24h - a.change24h;
      case 'recommended':
      default:
        // Prioritize beginner friendly, then lower volatility
        if (a.beginnerFriendly && !b.beginnerFriendly) return -1;
        if (!a.beginnerFriendly && b.beginnerFriendly) return 1;
        return a.volatilityMetric.beta - b.volatilityMetric.beta;
    }
  });

  return filtered;
}

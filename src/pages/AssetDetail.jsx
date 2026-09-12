import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Star, 
  Bookmark, 
  BookmarkCheck, 
  Layers, 
  PieChart, 
  Coins, 
  BarChart3, 
  Calendar,
  Sparkles,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { getAssetById, calculateRiskLevel } from '../services/assetsService';
import RiskGauge from '../components/detail/RiskGauge';
import JargonExplainer from '../components/detail/JargonExplainer';
import AssetChatbot from '../components/detail/AssetChatbot';
import { useApp } from '../context/AppContext';

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookmarkedAssets, toggleBookmark } = useApp();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      const data = await getAssetById(id);
      if (isMounted) {
        setAsset(data);
        setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-surface-100 rounded-xl" />
        <div className="h-44 bg-surface-100 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-surface-100 rounded-2xl" />
          <div className="h-96 bg-surface-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-surface-200 shadow-minimal">
        <h2 className="text-xl font-bold text-surface-900 mb-2">Asset Not Found</h2>
        <p className="text-sm text-surface-500 mb-6 font-medium">The requested investment asset could not be located.</p>
        <Link
          to="/explore"
          className="px-5 py-2.5 bg-surface-900 text-white font-bold rounded-xl text-sm hover:bg-surface-800 transition shadow-minimal"
        >
          Return to Explore Catalog
        </Link>
      </div>
    );
  }

  const risk = calculateRiskLevel(asset);
  const isBookmarked = bookmarkedAssets.includes(asset.id);
  const isPositive = asset.change24h >= 0;

  return (
    <div className="space-y-8 animate-fadeIn font-sans">
      {/* Back Link & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/explore')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-surface-600 hover:text-surface-900 bg-white px-3.5 py-2 rounded-xl border border-surface-200 shadow-minimal transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Back to Explore</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleBookmark(asset.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition shadow-minimal ${
              isBookmarked
                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                : 'bg-white text-surface-600 border-surface-200 hover:text-surface-900'
            }`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-yellow-600 stroke-[1.5]" />
            ) : (
              <Bookmark className="w-3.5 h-3.5 stroke-[1.5]" />
            )}
            <span>{isBookmarked ? 'Saved to Watchlist' : 'Watchlist'}</span>
          </button>

          <Link
            to={`/decide?asset=${asset.id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-900 hover:bg-surface-800 text-white text-xs font-bold shadow-minimal transition"
          >
            <Target className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Test Fit in Decide Coach</span>
          </Link>
        </div>
      </div>

      {/* Asset Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-200 relative overflow-hidden shadow-minimal">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-surface-500 bg-surface-50 px-2.5 py-1 rounded-md border border-surface-200">
                {asset.category.replace('_', ' ')}
              </span>
              <span className="text-xs font-semibold text-surface-500">{asset.sector}</span>
              {asset.beginnerFriendly && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md bg-surface-900 text-white border border-surface-900">
                  <Star className="w-3.5 h-3.5 fill-white stroke-[1.5]" />
                  <span>Beginner Top Pick</span>
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900">
                {asset.name}
              </h1>
              <span className="text-sm sm:text-base font-mono font-bold text-surface-600 bg-surface-50 px-3 py-1.5 rounded-lg border border-surface-200">
                {asset.symbol}
              </span>
            </div>

            <p className="text-sm text-surface-600 mt-3 max-w-2xl leading-relaxed font-medium">
              {asset.shortDescription}
            </p>
          </div>

          {/* Price & Change Box */}
          <div className="bg-surface-50 rounded-2xl p-5 border border-surface-200 text-right min-w-[200px] shrink-0 shadow-minimal">
            <span className="text-[11px] uppercase font-bold text-surface-400 block mb-1">
              Live Mock Price
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-surface-900">
              ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div
              className={`inline-flex items-center text-xs font-bold mt-2 px-2.5 py-1 rounded-md border ${
                isPositive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1 stroke-[1.5]" /> : <TrendingDown className="w-3.5 h-3.5 mr-1 stroke-[1.5]" />}
              {isPositive ? `+${asset.change24h}% (24h)` : `${asset.change24h}% (24h)`}
            </div>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-surface-200">
          <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-minimal">
            <span className="text-[10px] uppercase font-bold text-surface-400 block mb-1">Market Cap</span>
            <span className="text-sm font-bold text-surface-900 block">{asset.metrics?.marketCap || 'N/A'}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-minimal">
            <span className="text-[10px] uppercase font-bold text-surface-400 block mb-1">Expense Ratio / Fee</span>
            <span className="text-sm font-bold text-green-600 block">
              {asset.metrics?.expenseRatio || '0.00%'}
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-minimal">
            <span className="text-[10px] uppercase font-bold text-surface-400 block mb-1">Dividend / Yield</span>
            <span className="text-sm font-bold text-surface-900 block">{asset.metrics?.dividendYield || '0.00%'}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-minimal">
            <span className="text-[10px] uppercase font-bold text-surface-400 block mb-1">Valuation (P/E)</span>
            <span className="text-sm font-bold text-surface-900 block">{asset.metrics?.peRatio || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Risk & Jargon Analysis (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Visual Risk Indicator Component */}
          <RiskGauge asset={asset} />

          {/* Plain English Jargon Translator Component */}
          <JargonExplainer asset={asset} />

          {/* Historical Returns Card */}
          {asset.metrics?.historicalReturns && (
            <div className="bg-white rounded-2xl p-6 border border-surface-200 space-y-4 shadow-minimal">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-surface-900 stroke-[1.5]" />
                <h3 className="text-sm font-bold text-surface-900">Historical Performance Snapshot</h3>
              </div>
              <p className="text-xs text-surface-500 font-medium">
                Past returns do not guarantee future performance, but illustrate typical compound horizons:
              </p>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {Object.entries(asset.metrics.historicalReturns).map(([period, ret]) => (
                  <div key={period} className="bg-surface-50 p-4 rounded-xl border border-surface-200 text-center shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-surface-400 block mb-1">{period} Return</span>
                    <span className="text-base font-bold text-surface-900 block">{ret}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Scoped Chatbot Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <AssetChatbot asset={asset} />

          {/* Decision Coach CTA Card */}
          <div className="bg-white p-6 rounded-2xl border border-surface-200 text-center space-y-4 shadow-minimal">
            <div className="w-12 h-12 rounded-full bg-surface-50 border border-surface-200 text-surface-900 flex items-center justify-center mx-auto shadow-sm">
              <Target className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h4 className="font-bold text-surface-900 text-sm">
              Not sure if {asset.symbol} fits your goals?
            </h4>
            <p className="text-xs text-surface-600 leading-relaxed font-medium">
              Take our 2-minute reflective decision flow to compare your timeline and risk appetite directly against {asset.name}'s <strong className={risk.textColor}>{risk.level} Risk</strong> profile.
            </p>
            <Link
              to={`/decide?asset=${asset.id}`}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-surface-900 hover:bg-surface-800 text-white font-bold text-xs rounded-xl transition shadow-minimal"
            >
              <span>Launch Decision Coach</span>
              <ExternalLink className="w-4 h-4 stroke-[1.5]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

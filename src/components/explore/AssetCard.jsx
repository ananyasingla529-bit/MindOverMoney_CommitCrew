import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  Star, 
  ArrowRight,
  Target,
  PieChart,
  Layers,
  Coins
} from 'lucide-react';
import { calculateRiskLevel } from '../../services/assetsService';

export default function AssetCard({ asset }) {
  const risk = calculateRiskLevel(asset);
  const isPositive = asset.change24h >= 0;

  const getCategoryMeta = (cat) => {
    switch (cat) {
      case 'stock':
        return { label: 'Stock', icon: Layers };
      case 'mutual_fund':
        return { label: 'Fund / ETF', icon: PieChart };
      case 'crypto':
        return { label: 'Crypto', icon: Coins };
      default:
        return { label: cat, icon: Layers };
    }
  };

  const catMeta = getCategoryMeta(asset.category);
  const CatIcon = catMeta.icon;

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col justify-between relative group border border-surface-200 shadow-minimal hover:shadow-sm transition-shadow font-sans">
      {/* Top badges bar */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category tag */}
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border border-surface-200 bg-surface-50 text-surface-600">
              <CatIcon className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>{catMeta.label}</span>
            </span>

            {/* Beginner Highlight Badge */}
            {asset.beginnerFriendly && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-surface-900 text-white border border-surface-900 shadow-minimal">
                <Star className="w-3 h-3 fill-white stroke-[1.5]" />
                <span>Beginner</span>
              </span>
            )}
          </div>

          {/* Risk Badge */}
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border bg-white ${risk.textColor} border-surface-200`}
            title={risk.reason}
          >
            {risk.level === 'Low' && <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5]" />}
            {risk.level === 'Medium' && <AlertTriangle className="w-3.5 h-3.5 stroke-[1.5]" />}
            {risk.level === 'High' && <Flame className="w-3.5 h-3.5 stroke-[1.5]" />}
            <span>{risk.level} Risk</span>
          </span>
        </div>

        {/* Asset Title & Symbol */}
        <div className="flex items-baseline justify-between mb-1.5">
          <h3 className="font-bold text-lg text-surface-900 group-hover:text-surface-600 transition-colors">
            {asset.name}
          </h3>
          <span className="text-xs font-mono font-bold text-surface-500 bg-surface-100 px-2 py-1 rounded-md border border-surface-200">
            {asset.symbol}
          </span>
        </div>
        <p className="text-xs text-surface-500 font-semibold mb-4">{asset.sector}</p>

        {/* Short Plain-English Description */}
        <p className="text-sm text-surface-600 line-clamp-2 leading-relaxed mb-6 font-medium">
          {asset.shortDescription}
        </p>
      </div>

      {/* Metrics & Volatility Summary */}
      <div className="pt-4 border-t border-surface-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-surface-400 block font-bold mb-1">
              Current Price
            </span>
            <span className="text-lg font-bold text-surface-900">
              ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-widest text-surface-400 block font-bold mb-1">
              24h Trend
            </span>
            <span
              className={`inline-flex items-center text-sm font-bold ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4 mr-1 stroke-[1.5]" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1 stroke-[1.5]" />
              )}
              {isPositive ? `+${asset.change24h}%` : `${asset.change24h}%`}
            </span>
          </div>
        </div>

        {/* Volatility Indicator Pill */}
        <div className="bg-surface-50 rounded-xl p-3 mb-5 flex items-center justify-between text-xs border border-surface-200 font-medium">
          <span className="text-surface-500">
            Beta: <strong className="text-surface-900 ml-1">{asset.volatilityMetric?.beta}</strong>
          </span>
          <span className="text-surface-500">
            Annual Vol: <strong className="text-surface-900 ml-1">{asset.volatilityMetric?.annualizedVolatility}%</strong>
          </span>
        </div>

        {/* Interactive Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to={`/asset/${asset.id}`}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-surface-50 text-surface-900 font-semibold text-sm border border-surface-200 transition shadow-minimal"
          >
            <span>Learn More</span>
            <ArrowRight className="w-4 h-4 stroke-[1.5]" />
          </Link>

          <Link
            to={`/decide?asset=${asset.id}`}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-surface-900 hover:bg-surface-800 text-white font-semibold text-sm transition shadow-minimal"
          >
            <Target className="w-4 h-4 stroke-[1.5]" />
            <span>Decide Fit</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Target, ArrowRight, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AssetCard({ asset }) {
  const { bookmarkedAssets, toggleBookmark } = useApp();
  const isBookmarked = bookmarkedAssets.includes(asset.id);

  const riskBadgeColors = {
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    High: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-minimal hover:shadow-card transition duration-200 flex flex-col justify-between space-y-4 group">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-100 border border-surface-200 flex items-center justify-center font-bold text-surface-900 text-sm group-hover:scale-105 transition-transform shrink-0">
            {asset.symbol || 'FIN'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-surface-900 text-base group-hover:text-brand-600 transition">
                {asset.name}
              </h3>
            </div>
            <p className="text-xs text-surface-500 font-medium">
              {asset.sector || asset.category}
            </p>
          </div>
        </div>

        <button
          onClick={() => toggleBookmark(asset.id)}
          className={`p-2 rounded-xl border transition ${
            isBookmarked
              ? 'bg-amber-500 text-white border-amber-500 shadow-minimal'
              : 'bg-surface-50 text-surface-400 hover:text-surface-900 border-surface-200 hover:bg-surface-100'
          }`}
          title="Bookmark Asset"
        >
          <Bookmark className="w-4 h-4 stroke-[1.5]" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-surface-50 border border-surface-100 text-xs">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-surface-400 font-bold">Price</span>
          <p className="font-extrabold text-surface-900 mt-0.5">
            ${asset.price ? asset.price.toLocaleString() : 'N/A'}
          </p>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-surface-400 font-bold">Volatility</span>
          <p className="font-extrabold text-surface-900 mt-0.5 flex items-center gap-1">
            <span>{asset.volatility || 12}%</span>
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-surface-600 line-clamp-2 leading-relaxed font-medium">
        {asset.shortDescription || asset.description}
      </p>

      {/* Footer Tags & Actions */}
      <div className="pt-2 border-t border-surface-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${riskBadgeColors[asset.riskLevel] || riskBadgeColors.Low}`}>
            {asset.riskLevel} Risk
          </span>

          {asset.isBeginnerFriendly && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-100">
              <ShieldCheck className="w-3 h-3 stroke-[1.5]" />
              <span>Beginner Friendly</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link
            to={`/asset/${asset.id}`}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-surface-50 text-surface-900 font-semibold text-sm border border-surface-200 transition shadow-minimal"
          >
            <span>Learn More</span>
            <ArrowRight className="w-4 h-4 stroke-[1.5]" />
          </Link>

          <Link
            to={`/decide?asset=${asset.id}&tab=fit`}
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

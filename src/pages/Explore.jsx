import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Compass, 
  Star, 
  Info,
  Layers,
  Coins,
  PieChart
} from 'lucide-react';
import AssetCard from '../components/explore/AssetCard';
import { getAssets, filterAndSortAssets } from '../services/assetsService';

export default function Explore() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [riskLevel, setRiskLevel] = useState('all');
  const [beginnerOnly, setBeginnerOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      const data = await getAssets();
      if (isMounted) {
        setAssets(data);
        setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const filteredAssets = useMemo(() => {
    return filterAndSortAssets(assets, {
      category,
      riskLevel,
      search,
      beginnerOnly,
      sortBy
    });
  }, [assets, category, riskLevel, search, beginnerOnly, sortBy]);

  const beginnerPicks = useMemo(() => {
    return assets.filter(a => a.beginnerFriendly);
  }, [assets]);

  const resetFilters = () => {
    setSearch('');
    setCategory('all');
    setRiskLevel('all');
    setBeginnerOnly(false);
    setSortBy('recommended');
  };

  return (
    <div className="space-y-8 animate-fadeIn font-sans">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-surface-200 p-6 sm:p-8 shadow-minimal">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-50 border border-surface-200 text-surface-600 text-xs font-bold mb-4 shadow-minimal">
            <Compass className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Calm & Transparent Investing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 tracking-tight leading-tight">
            Explore Assets Without the Financial Fog.
          </h1>
          <p className="text-base sm:text-lg text-surface-600 mt-4 leading-relaxed font-medium">
            Every asset below includes transparent risk metrics, plain-English definitions, and a personal tutor to answer questions before you ever invest a single dollar.
          </p>

          {/* Quick Beginner Stats */}
          <div className="flex items-center gap-6 mt-8 pt-6 border-t border-surface-200 text-xs text-surface-500">
            <div>
              <span className="text-surface-900 font-bold text-lg block">{assets.length}</span>
              <span className="text-surface-500 font-medium">Total Assets</span>
            </div>
            <div className="h-8 w-px bg-surface-200" />
            <div>
              <span className="text-surface-900 font-bold text-lg block">{beginnerPicks.length}</span>
              <span className="text-surface-500 font-medium">Beginner Favorites</span>
            </div>
            <div className="h-8 w-px bg-surface-200" />
            <div>
              <span className="text-surface-900 font-bold text-lg block">100%</span>
              <span className="text-surface-500 font-medium">Transparent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Beginner Spotlight Shelf */}
      {!beginnerOnly && category === 'all' && riskLevel === 'all' && !search && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white border border-surface-200 flex items-center justify-center shadow-minimal">
                <Star className="w-4 h-4 text-surface-900 fill-surface-900 stroke-[1.5]" />
              </div>
              <h2 className="text-xl font-bold text-surface-900">Curated Beginner Cornerstones</h2>
            </div>
            <button
              onClick={() => setBeginnerOnly(true)}
              className="text-sm font-semibold text-surface-600 hover:text-surface-900 flex items-center gap-1 transition"
            >
              View all {beginnerPicks.length} beginner assets →
            </button>
          </div>
          <p className="text-sm text-surface-500 font-medium">
            Assets selected for lower volatility (Beta &lt; 1.15), broad diversification, or decades of resilient corporate earnings.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
            {beginnerPicks.slice(0, 3).map(asset => (
              <AssetCard key={`spotlight-${asset.id}`} asset={asset} />
            ))}
          </div>
        </section>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-surface-200 shadow-minimal space-y-4">
        {/* Top row: Search input + Beginner toggle + Sort */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
              <Search className="w-4 h-4 stroke-[1.5]" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by asset name, ticker (VOO, AAPL, BTC), or sector..."
              className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-surface-900 focus:border-transparent transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-surface-500 hover:text-surface-900"
              >
                Clear
              </button>
            )}
          </div>

          {/* Right controls: Beginner toggle & Sort dropdown */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Best for Beginners toggle switch */}
            <button
              onClick={() => setBeginnerOnly(!beginnerOnly)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold border transition shadow-minimal ${
                beginnerOnly
                  ? 'bg-surface-900 text-white border-surface-900'
                  : 'bg-white text-surface-600 border-surface-200 hover:text-surface-900 hover:border-surface-300'
              }`}
            >
              <Star className={`w-4 h-4 stroke-[1.5] ${beginnerOnly ? 'fill-white' : ''}`} />
              <span>Best for Beginners</span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-surface-200 rounded-xl px-4 py-3 text-xs text-surface-700 font-semibold focus:outline-none focus:ring-2 focus:ring-surface-900 shadow-minimal transition"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="volatility-asc">Volatility: Lowest First</option>
              <option value="volatility-desc">Volatility: Highest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="change-desc">24h Gainers</option>
            </select>
          </div>
        </div>

        {/* Filter Pills row: Categories and Risk Levels */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-surface-200 text-sm">
          {/* Categories */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-surface-500 font-semibold mr-2 text-xs">Category:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'stock', label: 'Stocks' },
              { id: 'mutual_fund', label: 'Funds & ETFs' },
              { id: 'crypto', label: 'Crypto' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                className={`px-4 py-1.5 rounded-full font-medium text-xs transition border ${
                  category === tab.id
                    ? 'bg-surface-900 text-white border-surface-900 shadow-minimal'
                    : 'bg-white text-surface-600 border-surface-200 hover:text-surface-900 hover:bg-surface-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Risk Level Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-surface-500 font-semibold mr-2 text-xs">Risk Level:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'low', label: 'Low' },
              { id: 'medium', label: 'Medium' },
              { id: 'high', label: 'High' }
            ].map(risk => (
              <button
                key={risk.id}
                onClick={() => setRiskLevel(risk.id)}
                className={`px-4 py-1.5 rounded-full font-medium text-xs transition border ${
                  riskLevel === risk.id
                    ? 'bg-surface-900 text-white border-surface-900 shadow-minimal'
                    : 'bg-white text-surface-600 border-surface-200 hover:text-surface-900 hover:bg-surface-50'
                }`}
              >
                {risk.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Catalog Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-surface-900 flex items-center gap-3">
            <span>Asset Catalog</span>
            <span className="text-xs font-semibold text-surface-600 bg-white border border-surface-200 px-3 py-1 rounded-full shadow-minimal">
              {filteredAssets.length} of {assets.length}
            </span>
          </h2>

          {(category !== 'all' || riskLevel !== 'all' || beginnerOnly || search) && (
            <button
              onClick={resetFilters}
              className="text-sm text-surface-500 hover:text-surface-900 font-semibold transition"
            >
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-64 rounded-2xl bg-surface-100 animate-pulse border border-surface-200" />
            ))}
          </div>
        ) : filteredAssets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssets.map(asset => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-2xl bg-white border border-surface-200 shadow-minimal">
            <Info className="w-10 h-10 text-surface-400 mx-auto mb-4 stroke-[1.5]" />
            <h3 className="text-lg font-bold text-surface-900 mb-2">No investment assets match your filters</h3>
            <p className="text-sm text-surface-500 max-w-sm mx-auto mb-6">
              Try adjusting your search keywords, turning off the beginner filter, or selecting "All" categories.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 bg-surface-900 text-white font-semibold text-sm rounded-xl hover:bg-surface-800 transition shadow-minimal"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

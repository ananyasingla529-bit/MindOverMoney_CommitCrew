import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Flame, 
  RotateCcw,
  Clock,
  HeartHandshake,
  Bookmark,
  Check,
  Compass,
  Lightbulb
} from 'lucide-react';
import { getAssets, calculateRiskLevel } from '../services/assetsService';
import { useApp } from '../context/AppContext';

export default function Decide() {
  const [searchParams] = useSearchParams();
  const initialAssetId = searchParams.get('asset') || 'vanguard-sp500-etf';
  const { saveDecision, savedDecisions } = useApp();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [goal, setGoal] = useState('long_term');
  const [horizon, setHorizon] = useState('long');
  const [riskComfort, setRiskComfort] = useState('cautious');
  const [selectedAssetId, setSelectedAssetId] = useState(initialAssetId);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const data = await getAssets();
      if (isMounted) {
        setAssets(data);
        setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const selectedAsset = useMemo(() => {
    return assets.find(a => a.id === selectedAssetId) || assets[0] || null;
  }, [assets, selectedAssetId]);

  // Personalized Alignment Engine
  const recommendation = useMemo(() => {
    if (!selectedAsset) return null;
    const risk = calculateRiskLevel(selectedAsset);
    const assetRisk = risk.level; // 'Low' | 'Medium' | 'High'
    const beta = selectedAsset.volatilityMetric?.beta || 1.0;
    const vol = selectedAsset.volatilityMetric?.annualizedVolatility || 15;

    let score = 50;
    let verdict = 'Moderate Fit';
    let verdictColor = 'amber';
    let reflections = [];
    let rules = [];

    // Goal alignment
    if (goal === 'emergency') {
      if (assetRisk === 'Low' && selectedAsset.category === 'mutual_fund' && selectedAsset.sector.includes('Bond')) {
        score += 35;
        reflections.push(`Your goal is an emergency reserve or short-term cushion. ${selectedAsset.name}'s ultra-low beta (${beta}) and capital-preservation focus protect you from sudden liquid losses.`);
      } else {
        score -= 40;
        reflections.push(`⚠️ Crucial Warning: You chose "Emergency Cushion", but ${selectedAsset.name} carries ${assetRisk} Risk. Emergency savings should NEVER be in volatile stocks or crypto, because a market drop could force you to sell at a loss to pay bills.`);
      }
    } else if (goal === 'milestone_3yr') {
      if (assetRisk === 'Low') {
        score += 30;
        reflections.push(`For a 3–5 year goal, ${selectedAsset.name}'s low volatility profile provides a steady balance between outperforming inflation and protecting your principal.`);
      } else if (assetRisk === 'Medium') {
        score += 15;
        reflections.push(`A 3–5 year timeline gives ${selectedAsset.name} moderate time to ride out temporary dips, though you should prepare to shift to bonds as your purchase date approaches.`);
      } else {
        score -= 25;
        reflections.push(`High volatility assets like ${selectedAsset.name} have historically experienced 2-4 year drawdowns. You risk needing your money right when the market is down.`);
      }
    } else if (goal === 'long_term') {
      if (assetRisk === 'Medium' || (assetRisk === 'Low' && selectedAsset.category !== 'crypto')) {
        score += 40;
        reflections.push(`A long-term horizon (7+ years) is the ideal match for ${selectedAsset.name}. Long holding periods allow compound growth to smooth over annual volatility.`);
      } else if (assetRisk === 'High') {
        score += 20;
        reflections.push(`With a 7+ year horizon, you have sufficient time for a High-Risk asset like ${selectedAsset.name} to recover from sharp drawdowns, provided you keep your allocation modest.`);
      }
    } else if (goal === 'pocket_money') {
      score += 25;
      reflections.push(`Since you are investing discretionary learning funds, ${selectedAsset.name} will give you direct educational experience with real-world market movements without risking your essential livelihood.`);
    }

    // Horizon alignment
    if (horizon === 'short' && assetRisk !== 'Low') {
      score -= 25;
      reflections.push(`Your timeframe is under 1 year. Assets with an annualized volatility of ${vol}% are unsuitable for sub-12-month periods.`);
    } else if (horizon === 'long') {
      score += 15;
    }

    // Risk comfort alignment
    if (riskComfort === 'panic') {
      if (assetRisk === 'High') {
        score -= 35;
        reflections.push(`You noted that a 15% dip causes severe panic. ${selectedAsset.name} has a historical maximum drawdown of ${selectedAsset.volatilityMetric?.maxDrawdown}%. Investing heavily here would likely lead to sleepless nights and panic-selling at the bottom.`);
      } else if (assetRisk === 'Low') {
        score += 20;
        reflections.push(`Your preference for low emotional stress aligns perfectly with ${selectedAsset.name}'s calm, defensive Beta of ${beta}.`);
      }
    } else if (riskComfort === 'cautious') {
      if (assetRisk === 'High') {
        score -= 10;
        reflections.push(`While you can tolerate normal fluctuations, ${selectedAsset.name}'s high volatility (${vol}%) exceeds typical market cycles. A small pilot position is recommended.`);
      } else {
        score += 20;
        reflections.push(`Your cautious patience is well-suited to holding ${selectedAsset.name} through regular market swings.`);
      }
    } else if (riskComfort === 'resilient') {
      score += 20;
      reflections.push(`Your resilient mindset enables you to treat price drops as long-term buying opportunities rather than threats.`);
    }

    // Normalize score
    score = Math.max(15, Math.min(98, score));

    if (score >= 80) {
      verdict = 'Strong Personal Alignment';
      verdictColor = 'emerald';
    } else if (score >= 50) {
      verdict = 'Moderate Fit with Caution';
      verdictColor = 'amber';
    } else {
      verdict = 'High Risk Mismatch';
      verdictColor = 'rose';
    }

    // Generate 3 Actionable Rules
    if (assetRisk === 'High') {
      rules = [
        'Allocation Limit: Keep this asset to no more than 3% to 5% of your total investable net worth.',
        'Dollar-Cost Average: Never invest a lump sum into high-beta assets; spread purchases across monthly tranches.',
        'Emergency Buffer: Ensure 3–6 months of living expenses are parked safely in a high-yield savings account before buying.'
      ];
    } else if (assetRisk === 'Medium') {
      rules = [
        'Core Foundation First: Pair this company stock or tech fund with a broad index fund (like VOO) for balance.',
        'Ignore Daily Swings: Set a rule to check your portfolio only once a month to prevent emotional over-trading.',
        'Reinvest Dividends: Enable automated DRIP so payouts automatically buy more shares over time.'
      ];
    } else {
      rules = [
        'Decade Compounding: Let this asset sit undisturbed. Its low expense ratio and broad base make it an ideal foundational holding.',
        'Automate Contributions: Set up an automatic monthly transfer (even $50/mo) into this asset.',
        'Stay Consistent: Do not abandon low-risk cornerstones when headlines hype speculative meme tokens.'
      ];
    }

    return {
      score,
      verdict,
      verdictColor,
      reflections,
      rules,
      risk
    };
  }, [selectedAsset, goal, horizon, riskComfort]);

  const handleSaveAssessment = () => {
    if (!selectedAsset || !recommendation) return;
    saveDecision({
      assetName: selectedAsset.name,
      assetSymbol: selectedAsset.symbol,
      assetRisk: selectedAsset.riskLevel,
      score: recommendation.score,
      verdict: recommendation.verdict,
      goal,
      horizon,
      riskComfort
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn font-sans">
      {/* Page Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-50 border border-surface-200 text-surface-600 text-xs font-bold shadow-minimal">
          <Compass className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Interactive Decision Coach</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 tracking-tight mt-3">
          Find Out If an Asset Truly Fits Your Risk & Goals.
        </h1>
        <p className="text-sm text-surface-600 mt-2 font-medium">
          Answer 3 quick questions. Our reflective coach analyzes your emotional comfort against the asset's exact volatility metrics.
        </p>
      </div>

      {/* Progress Step Indicator */}
      <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
        {[
          { num: 1, label: 'Goal' },
          { num: 2, label: 'Horizon' },
          { num: 3, label: 'Comfort' },
          { num: 4, label: 'Asset' },
          { num: 5, label: 'Result' }
        ].map((s) => (
          <React.Fragment key={s.num}>
            <button
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-minimal border ${
                step === s.num
                  ? 'bg-surface-900 text-white border-surface-900'
                  : step > s.num
                  ? 'bg-white text-surface-900 border-surface-900 hover:bg-surface-50'
                  : 'bg-white text-surface-400 border-surface-200 hover:border-surface-300'
              }`}
            >
              <span>{s.num}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {s.num < 5 && <div className="w-4 h-px bg-surface-300" />}
          </React.Fragment>
        ))}
      </div>

      {/* Wizard Steps Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-200 shadow-minimal">
        {/* STEP 1: Investment Goal */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2 text-surface-500">
              <Target className="w-5 h-5 stroke-[1.5]" />
              <span className="text-xs font-bold uppercase tracking-wider">Step 1 of 4: Primary Goal</span>
            </div>
            <h2 className="text-xl font-bold text-surface-900">What is the primary purpose of this money?</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: 'emergency',
                  title: 'Emergency Cushion / Living Buffer',
                  desc: 'Need funds readily accessible for unexpected expenses. Cannot afford to lose principal.',
                  badge: 'Highest Safety Needed'
                },
                {
                  id: 'milestone_3yr',
                  title: 'Specific Goal in 3–5 Years',
                  desc: 'Saving for a car, apartment deposit, or tuition. Want growth but timeline is fixed.',
                  badge: 'Balanced Growth'
                },
                {
                  id: 'long_term',
                  title: 'Long-Term Wealth & Retirement (7+ Yrs)',
                  desc: 'Building wealth for the future. Can handle market ups and downs for maximum compound gains.',
                  badge: 'Compounding Horizon'
                },
                {
                  id: 'pocket_money',
                  title: 'Learning with Pocket Stakes',
                  desc: 'Discretionary funds set aside specifically to learn the ropes of investing hands-on.',
                  badge: 'Educational Sandbox'
                }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setGoal(opt.id)}
                  className={`p-5 rounded-2xl text-left border transition relative flex flex-col justify-between shadow-minimal ${
                    goal === opt.id
                      ? 'bg-surface-50 border-surface-900 text-surface-900'
                      : 'bg-white border-surface-200 text-surface-600 hover:border-surface-300 hover:bg-surface-50'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-surface-500 block mb-1">
                      {opt.badge}
                    </span>
                    <h3 className={`font-bold text-sm mb-1.5 ${goal === opt.id ? 'text-surface-900' : 'text-surface-800'}`}>{opt.title}</h3>
                    <p className={`text-xs leading-relaxed font-medium ${goal === opt.id ? 'text-surface-600' : 'text-surface-500'}`}>{opt.desc}</p>
                  </div>
                  {goal === opt.id && (
                    <div className="mt-3 flex items-center gap-1 text-xs font-bold text-surface-900">
                      <Check className="w-4 h-4 stroke-[1.5]" /> Selected
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-5 border-t border-surface-200 mt-2">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 bg-surface-900 hover:bg-surface-800 text-white font-bold text-sm rounded-xl transition shadow-minimal"
              >
                <span>Continue to Horizon</span>
                <ArrowRight className="w-4 h-4 stroke-[1.5]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Time Horizon */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2 text-surface-500">
              <Clock className="w-5 h-5 stroke-[1.5]" />
              <span className="text-xs font-bold uppercase tracking-wider">Step 2 of 4: Timeline</span>
            </div>
            <h2 className="text-xl font-bold text-surface-900">When will you realistically need to withdraw this money?</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: 'short',
                  title: 'Under 1 Year (Immediate)',
                  desc: 'Need cash within months. Cannot endure a 20% stock market correction.',
                  tag: '< 12 Months'
                },
                {
                  id: 'medium_short',
                  title: '1 to 3 Years',
                  desc: 'Short-to-medium runway. Need conservative growth with low drawdown risk.',
                  tag: '1–3 Years'
                },
                {
                  id: 'medium_long',
                  title: '3 to 7 Years',
                  desc: 'Solid runway. Can absorb typical 1-year recessions for higher expected yields.',
                  tag: '3–7 Years'
                },
                {
                  id: 'long',
                  title: '7+ Years (Decade Horizon)',
                  desc: 'Long runway. Daily noise and short bear markets will not impact your life.',
                  tag: '7+ Years'
                }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setHorizon(opt.id)}
                  className={`p-5 rounded-2xl text-left border transition relative flex flex-col justify-between shadow-minimal ${
                    horizon === opt.id
                      ? 'bg-surface-50 border-surface-900 text-surface-900'
                      : 'bg-white border-surface-200 text-surface-600 hover:border-surface-300 hover:bg-surface-50'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold text-surface-500 block mb-1 uppercase tracking-wider">{opt.tag}</span>
                    <h3 className={`font-bold text-sm mb-1.5 ${horizon === opt.id ? 'text-surface-900' : 'text-surface-800'}`}>{opt.title}</h3>
                    <p className={`text-xs leading-relaxed font-medium ${horizon === opt.id ? 'text-surface-600' : 'text-surface-500'}`}>{opt.desc}</p>
                  </div>
                  {horizon === opt.id && (
                    <div className="mt-3 flex items-center gap-1 text-xs font-bold text-surface-900">
                      <Check className="w-4 h-4 stroke-[1.5]" /> Selected
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-5 border-t border-surface-200 mt-2">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-surface-500 hover:text-surface-900 hover:bg-surface-50 rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4 stroke-[1.5]" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-2.5 bg-surface-900 hover:bg-surface-800 text-white font-bold text-sm rounded-xl transition shadow-minimal"
              >
                <span>Continue to Risk Comfort</span>
                <ArrowRight className="w-4 h-4 stroke-[1.5]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Emotional Risk Comfort */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2 text-surface-500">
              <HeartHandshake className="w-5 h-5 stroke-[1.5]" />
              <span className="text-xs font-bold uppercase tracking-wider">Step 3 of 4: Gut Check</span>
            </div>
            <h2 className="text-xl font-bold text-surface-900">If your portfolio dropped 15% next week, what would you do?</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  id: 'panic',
                  title: 'Panic & Sell',
                  desc: '"I would feel sick to my stomach and sell to stop losing more money."',
                  level: 'Low Risk Appetite',
                  color: 'text-surface-600'
                },
                {
                  id: 'cautious',
                  title: 'Feel Uneasy, But Wait',
                  desc: '"I would check my phone anxiously, but know market drops are normal and hold on."',
                  level: 'Medium Risk Appetite',
                  color: 'text-surface-600'
                },
                {
                  id: 'resilient',
                  title: 'Buy More on Sale',
                  desc: '"I love discounts. When quality assets drop, I see it as an opportunity to invest more."',
                  level: 'High Risk Appetite',
                  color: 'text-surface-600'
                }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setRiskComfort(opt.id)}
                  className={`p-5 rounded-2xl text-left border transition flex flex-col justify-between shadow-minimal ${
                    riskComfort === opt.id
                      ? 'bg-surface-50 border-surface-900 text-surface-900'
                      : 'bg-white border-surface-200 text-surface-600 hover:border-surface-300 hover:bg-surface-50'
                  }`}
                >
                  <div>
                    <span className={`text-[10px] font-bold block mb-1 uppercase tracking-wider ${opt.color}`}>{opt.level}</span>
                    <h3 className={`font-bold text-sm mb-2 ${riskComfort === opt.id ? 'text-surface-900' : 'text-surface-800'}`}>{opt.title}</h3>
                    <p className={`text-xs italic leading-relaxed font-medium ${riskComfort === opt.id ? 'text-surface-600' : 'text-surface-500'}`}>{opt.desc}</p>
                  </div>
                  {riskComfort === opt.id && (
                    <div className="mt-4 flex items-center gap-1 text-xs font-bold text-surface-900">
                      <Check className="w-4 h-4 stroke-[1.5]" /> Selected
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-5 border-t border-surface-200 mt-2">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-surface-500 hover:text-surface-900 hover:bg-surface-50 rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4 stroke-[1.5]" /> Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex items-center gap-2 px-6 py-2.5 bg-surface-900 hover:bg-surface-800 text-white font-bold text-sm rounded-xl transition shadow-minimal"
              >
                <span>Select Asset to Evaluate</span>
                <ArrowRight className="w-4 h-4 stroke-[1.5]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Choose Asset */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2 text-surface-500">
              <Target className="w-5 h-5 stroke-[1.5]" />
              <span className="text-xs font-bold uppercase tracking-wider">Step 4 of 4: Asset Selection</span>
            </div>
            <h2 className="text-xl font-bold text-surface-900">Which asset do you want to evaluate against your profile?</h2>

            {/* Asset Selector Dropdown / Grid */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-surface-600">Choose from Catalog:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                {assets.map(a => {
                  const r = calculateRiskLevel(a);
                  const isSel = a.id === selectedAssetId;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAssetId(a.id)}
                      className={`p-4 rounded-xl text-left border transition flex items-center justify-between shadow-minimal ${
                        isSel
                          ? 'bg-surface-900 border-surface-900 text-white font-bold'
                          : 'bg-white border-surface-200 text-surface-600 hover:border-surface-300 hover:bg-surface-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isSel ? 'text-white' : 'text-surface-900'}`}>{a.name}</span>
                        </div>
                        <span className={`text-[10px] ${isSel ? 'text-surface-300' : 'text-surface-500'} font-medium`}>{a.symbol} • ${a.price}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${isSel ? 'border-surface-700 bg-surface-800 text-white' : 'border-surface-200 bg-surface-50'}`}>
                        {r.level}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedAsset && (
                <div className="p-4 rounded-2xl bg-surface-50 border border-surface-200 flex items-center justify-between shadow-minimal mt-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-surface-500 font-bold block">Selected For Evaluation</span>
                    <h4 className="font-bold text-base text-surface-900 mt-1">
                      {selectedAsset.name} ({selectedAsset.symbol})
                    </h4>
                    <p className="text-xs text-surface-600 mt-1.5 font-medium">
                      {selectedAsset.sector} • Beta: {selectedAsset.volatilityMetric?.beta} • Volatility: {selectedAsset.volatilityMetric?.annualizedVolatility}%
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border bg-white shadow-sm ${recommendation?.risk.textColor} border-surface-200`}>
                    {selectedAsset.riskLevel} Risk
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-5 border-t border-surface-200 mt-2">
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-surface-500 hover:text-surface-900 hover:bg-surface-50 rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4 stroke-[1.5]" /> Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="flex items-center gap-2 px-6 py-2.5 bg-surface-900 text-white font-bold text-sm rounded-xl shadow-minimal transition hover:bg-surface-800"
              >
                <span>Generate Recommendation</span>
                <Target className="w-4 h-4 stroke-[1.5]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Reflective Recommendation Result */}
        {step === 5 && recommendation && selectedAsset && (
          <div className="space-y-6 animate-fadeIn">
            {/* Score Banner */}
            <div className="p-6 rounded-2xl bg-white border border-surface-200 shadow-minimal flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Circular / Pill Score */}
                <div
                  className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-bold shadow-minimal border-2 ${
                    recommendation.score >= 80
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : recommendation.score >= 50
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  <span className="text-2xl leading-none font-bold">{recommendation.score}%</span>
                  <span className="text-[10px] uppercase tracking-widest mt-1 font-semibold">Fit Score</span>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-surface-500">
                    Decision Analysis for {selectedAsset.symbol}
                  </span>
                  <h3 className="text-xl font-bold text-surface-900 mt-1">
                    {recommendation.verdict}
                  </h3>
                  <p className="text-xs text-surface-600 mt-1 font-medium">
                    Evaluated against your chosen {horizon} horizon & {riskComfort} risk appetite.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleSaveAssessment}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-surface-50 text-surface-900 text-xs font-bold border border-surface-200 transition shadow-minimal"
                >
                  <Bookmark className="w-4 h-4 stroke-[1.5]" />
                  <span>{savedSuccess ? 'Saved!' : 'Save Decision'}</span>
                </button>

                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-surface-600 hover:text-surface-900 text-xs font-semibold bg-surface-50 hover:bg-surface-100 transition border border-surface-200 shadow-minimal"
                >
                  <RotateCcw className="w-4 h-4 stroke-[1.5]" />
                  <span>Restart</span>
                </button>
              </div>
            </div>

            {/* Personalized Reflective Breakdown referencing Asset Risk */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-surface-900 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 stroke-[1.5]" />
                <span>Why this verdict?</span>
              </h4>

              <div className="space-y-3">
                {recommendation.reflections.map((ref, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-surface-50 border border-surface-200 text-sm text-surface-700 leading-relaxed font-medium shadow-minimal"
                  >
                    {ref}
                  </div>
                ))}
              </div>
            </div>

            {/* 3 Actionable Beginner Rules */}
            <div className="p-6 rounded-2xl bg-white border border-surface-200 shadow-minimal space-y-4 mt-2">
              <h4 className="text-sm font-bold text-surface-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
                <span>3 Golden Action Rules for This Investment:</span>
              </h4>
              <div className="space-y-3">
                {recommendation.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-surface-700 font-medium">
                    <div className="w-6 h-6 rounded-full bg-surface-100 border border-surface-200 text-surface-900 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 shadow-sm">
                      {idx + 1}
                    </div>
                    <span className="leading-relaxed">{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-surface-200">
              <Link
                to={`/asset/${selectedAsset.id}`}
                className="text-sm text-surface-600 hover:text-surface-900 font-bold transition"
              >
                ← Deep dive into {selectedAsset.symbol}
              </Link>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-white hover:bg-surface-50 text-surface-900 text-sm font-semibold rounded-xl border border-surface-200 shadow-minimal transition"
                >
                  Evaluate Another Asset
                </button>
                <Link
                  to="/learn"
                  className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-2.5 bg-surface-900 hover:bg-surface-800 text-white text-sm font-bold rounded-xl shadow-minimal transition"
                >
                  <span>Practice in Simulator</span>
                  <ArrowRight className="w-4 h-4 stroke-[1.5]" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Saved Decisions Drawer / List */}
      {savedDecisions.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-surface-200 space-y-4 shadow-minimal">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-surface-900 flex items-center gap-2">
              <Bookmark className="w-4 h-4 stroke-[1.5]" />
              <span>Saved Decision Assessments ({savedDecisions.length})</span>
            </h3>
            <span className="text-xs text-surface-500 font-medium">Stored in browser</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedDecisions.map((dec) => (
              <div
                key={dec.id}
                className="p-4 rounded-xl bg-surface-50 border border-surface-200 text-sm space-y-2 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-surface-900">{dec.assetName}</span>
                  <span className="font-mono font-bold text-surface-700 bg-white px-2 py-0.5 rounded border border-surface-200">{dec.score}%</span>
                </div>
                <p className="text-xs text-surface-600 font-medium">{dec.verdict}</p>
                <div className="text-[11px] text-surface-500 pt-2 border-t border-surface-200 flex justify-between font-medium">
                  <span>Risk: {dec.assetRisk}</span>
                  <span>{new Date(dec.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

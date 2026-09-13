import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Coins, 
  Compass, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle, 
  ShieldAlert, 
  ShieldCheck, 
  Flame, 
  Play, 
  ArrowRight,
  Lightbulb,
  Award,
  History,
  Database,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { getAssets, calculateRiskLevel } from '../services/assetsService';
import { fetchQuizQuestions, FALLBACK_QUIZ_QUESTIONS } from '../services/quizService';

export default function Learn() {
  const { 
    coins, 
    addCoins, 
    spendCoins, 
    quizProgress, 
    recordQuizAnswer, 
    resetQuiz,
    investments,
    recordInvestment,
    supabaseStatus
  } = useApp();

  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' | 'simulator'

  // Quiz state
  const [questions, setQuestions] = useState(FALLBACK_QUIZ_QUESTIONS);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [alreadyAnsweredNotice, setAlreadyAnsweredNotice] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState({});

  // Simulator state
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('vanguard-sp500-etf');
  const [coinAllocation, setCoinAllocation] = useState(50);
  const [simulationScenario, setSimulationScenario] = useState('historical_sample');
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // 1. Fetch questions dynamically from Supabase (or fallback)
  useEffect(() => {
    let isMounted = true;
    async function loadQuestions() {
      setQuestionsLoading(true);
      const data = await fetchQuizQuestions();
      if (isMounted) {
        setQuestions(data && data.length > 0 ? data : FALLBACK_QUIZ_QUESTIONS);
        setQuestionsLoading(false);
      }
    }
    loadQuestions();
    return () => { isMounted = false; };
  }, []);

  // 2. Fetch assets
  useEffect(() => {
    let isMounted = true;
    async function loadAssets() {
      const data = await getAssets();
      if (isMounted) {
        setAssets(data);
      }
    }
    loadAssets();
    return () => { isMounted = false; };
  }, []);

  const currentQ = questions[currentQIndex] || questions[0];
  const qState = sessionAnswers[currentQ?.id] || quizProgress.answered[currentQ?.id];

  const handleSelectAnswer = async (optionIndex) => {
    if (sessionAnswers[currentQ.id]) return; // Already answered in current session

    const isCorrect = optionIndex === currentQ.correctIndex;
    setSessionAnswers(prev => ({
      ...prev,
      [currentQ.id]: { selectedIndex: optionIndex, isCorrect }
    }));

    const res = await recordQuizAnswer(currentQ.id, optionIndex, isCorrect, currentQ.coins || 50);

    if (res?.alreadyAnswered) {
      setAlreadyAnsweredNotice(true);
      setTimeout(() => setAlreadyAnsweredNotice(false), 4000);
    }

    if (isCorrect) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  const handleRetakeQuiz = () => {
    setSessionAnswers({});
    setQuestions(prev => [...prev].sort(() => Math.random() - 0.5));
    setCurrentQIndex(0);
  };

  const selectedSimAsset = assets.find(a => a.id === selectedAssetId) || assets[0];

  // Run Simulator Logic & Persist to Supabase
  const handleRunSimulation = async () => {
    if (coinAllocation <= 0 || coinAllocation > coins) return;

    setIsSimulating(true);
    setSimulationResult(null);

    setTimeout(async () => {
      if (!selectedSimAsset) {
        setIsSimulating(false);
        return;
      }

      const risk = calculateRiskLevel(selectedSimAsset);
      const beta = selectedSimAsset.volatilityMetric?.beta || 1.0;
      let returnPct = 0;
      let lesson = '';

      switch (simulationScenario) {
        case 'historical_sample': {
          const returns = selectedSimAsset.metrics?.simulationMonthlyReturns || [1.5, 2.0, -1.0, 3.2];
          const totalSampleReturn = returns.reduce((acc, curr) => acc + curr, 0);
          returnPct = parseFloat(totalSampleReturn.toFixed(1));
          lesson = `Based on a 1-year historical sample slice for ${selectedSimAsset.name}, an investment generated a net ${returnPct >= 0 ? '+' : ''}${returnPct}%. Notice how ${risk.level} risk assets experience fluctuations month to month!`;
          break;
        }
        case 'bull_market': {
          returnPct = parseFloat((14 * Math.max(0.7, beta)).toFixed(1));
          lesson = `In an economic bull market expansion (+14% baseline), ${selectedSimAsset.name}'s Beta of ${beta} amplified returns to +${returnPct}%. High growth feels fantastic on the way up!`;
          break;
        }
        case 'market_correction': {
          returnPct = parseFloat((-12 * Math.max(0.4, beta)).toFixed(1));
          lesson = `During a market correction (-12% baseline), ${selectedSimAsset.name} moved by ${returnPct}%. With ${risk.level} risk, holding your nerve without panic selling was the test.`;
          break;
        }
        case 'inflation_cycle': {
          if (selectedSimAsset.category === 'mutual_fund' && selectedSimAsset.sector.includes('Bond')) {
            returnPct = -4.5;
            lesson = `During sudden interest rate spikes to fight inflation, existing bond funds drop temporarily before higher yields kick in.`;
          } else if (selectedSimAsset.id === 'bitcoin' || selectedSimAsset.id === 'solana') {
            returnPct = -28.0;
            lesson = `Speculative assets often experience extreme contractions (-28%) when interest rates rise and easy liquidity dries up.`;
          } else {
            returnPct = 3.2;
            lesson = `Quality businesses with strong pricing power can pass along inflation costs, generating modest positive real returns (+3.2%).`;
          }
          break;
        }
        case 'compound_5yr': {
          if (risk.level === 'High') {
            returnPct = parseFloat((65 + (beta * 15)).toFixed(1));
          } else if (risk.level === 'Medium') {
            returnPct = 48.0;
          } else {
            returnPct = 28.5;
          }
          lesson = `Holding uninterrupted over 5 years allowed compound returns to overcome yearly noise, turning ${coinAllocation} coins into a substantial gain. Time in the market beats timing the market!`;
          break;
        }
        default:
          returnPct = 8.5;
      }

      // Record investment in Supabase & deduct coins
      const res = await recordInvestment({
        asset: selectedSimAsset,
        coinsInvested: coinAllocation,
        scenario: simulationScenario,
        returnPct
      });

      const returnCoins = Math.round(coinAllocation * (1 + returnPct / 100));
      const netGain = returnCoins - coinAllocation;

      setSimulationResult({
        startingCoins: coinAllocation,
        endingCoins: returnCoins,
        netGain,
        returnPct,
        scenario: simulationScenario,
        asset: selectedSimAsset,
        lesson,
        persisted: res.success
      });

      setIsSimulating(false);
    }, 1000);
  };

  const handleCashOutSimulator = () => {
    if (simulationResult) {
      addCoins(simulationResult.endingCoins);
      setSimulationResult(null);
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn font-sans">
      {/* Top Banner with Coin Wallet & Backend status */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-minimal relative overflow-hidden">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-50 border border-surface-200 text-surface-600 text-xs font-bold shadow-minimal">
              <Compass className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Interactive Learning Hub</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-50 border border-surface-200 text-surface-600 text-xs font-semibold shadow-minimal">
              <Database className="w-3 h-3 stroke-[1.5]" />
              <span>Supabase: {supabaseStatus === 'connected' ? 'PostgreSQL Active' : 'Offline Fallback'}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 tracking-tight mt-2">
            Learn Investing Basics & Test in Safe Sandbox.
          </h1>
          <p className="text-sm sm:text-base text-surface-600 max-w-xl font-medium mt-1">
            Answer database-backed questions to earn virtual Mind Coins, then allocate coins in the practice simulator to record real portfolio scenarios.
          </p>
        </div>

        {/* Big Coins Wallet Badge */}
        <div className="bg-white p-5 rounded-2xl border border-surface-200 text-center min-w-[220px] shadow-minimal shrink-0">
          <span className="text-[11px] uppercase font-bold text-surface-500 block">Your Practice Wallet</span>
          <div className="text-3xl sm:text-4xl font-bold text-surface-900 flex items-center justify-center gap-2 mt-2">
            <Coins className="w-7 h-7 stroke-[1.5] text-surface-900" />
            <span>{coins}</span>
          </div>
          <span className="text-[11px] text-surface-500 block mt-1 font-medium">Virtual Coins (Zero Real Money)</span>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center justify-center p-1.5 bg-white rounded-2xl border border-surface-200 max-w-md mx-auto shadow-minimal">
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition ${
            activeTab === 'quiz'
              ? 'bg-surface-900 text-white shadow-minimal'
              : 'text-surface-600 hover:text-surface-900'
          }`}
        >
          <GraduationCap className="w-4 h-4 stroke-[1.5]" />
          <span>1. Basics Quiz (+Coins)</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition ${
            activeTab === 'simulator'
              ? 'bg-surface-900 text-white shadow-minimal'
              : 'text-surface-600 hover:text-surface-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 stroke-[1.5]" />
          <span>2. Practice Simulator</span>
        </button>
      </div>

      {/* TAB 1: Quiz Section */}
      {activeTab === 'quiz' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-200 space-y-6 shadow-minimal">
          {/* Quiz Header & Navigator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-surface-500">
                  Question {currentQIndex + 1} of {questions.length}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                  Infinite Practice Active
                </span>
              </div>
              <h2 className="text-lg font-bold text-surface-900 mt-0.5">Investing Fundamentals Quiz</h2>
            </div>

            {/* Question dots & Retake Button */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                {questions.map((q, idx) => {
                  const ans = sessionAnswers[q.id] || quizProgress.answered[q.id];
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center border ${
                        idx === currentQIndex
                          ? 'border-surface-900 bg-surface-900 text-white shadow-minimal'
                          : ans?.isCorrect
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : ans && !ans.isCorrect
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleRetakeQuiz}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-surface-50 hover:bg-surface-100 text-surface-700 border border-surface-200 transition flex items-center gap-1.5 shadow-minimal"
                title="Shuffle & Retake Quiz with Fresh Questions"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Retake Quiz</span>
              </button>
            </div>
          </div>

          {/* Repeat Attempt Notice */}
          {alreadyAnsweredNotice && (
            <div className="p-3 bg-surface-100 border border-surface-200 rounded-xl text-surface-700 text-xs flex items-center gap-2 shadow-minimal">
              <HelpCircle className="w-4 h-4 text-surface-500 shrink-0 stroke-[1.5]" />
              <span className="font-medium">You have already completed this question previously. Extra coins are only awarded once per question!</span>
            </div>
          )}

          {/* Question Text */}
          {questionsLoading ? (
            <div className="h-32 bg-surface-50 rounded-2xl animate-pulse border border-surface-200" />
          ) : currentQ ? (
            <>
              <div className="space-y-3">
                <span className="text-xs font-bold text-surface-600 bg-surface-50 px-3 py-1.5 rounded-md border border-surface-200 inline-block shadow-minimal">
                  Reward: +{currentQ.coins || 50} Coins
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-surface-900 leading-snug">
                  {currentQ.question}
                </h3>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = qState?.selectedIndex === oIdx;
                  const isCorrectOption = oIdx === currentQ.correctIndex;
                  const isAnswered = !!qState;

                  let btnStyle = 'bg-white border-surface-200 text-surface-700 hover:border-surface-300 hover:bg-surface-50';
                  if (isAnswered) {
                    if (isCorrectOption) {
                      btnStyle = 'bg-green-50 border-green-200 text-green-800 font-bold';
                    } else if (isSelected && !qState.isCorrect) {
                      btnStyle = 'bg-red-50 border-red-200 text-red-800';
                    } else {
                      btnStyle = 'bg-surface-50 border-surface-200 text-surface-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectAnswer(oIdx)}
                      disabled={isAnswered}
                      className={`p-4 rounded-2xl text-left border transition flex items-center justify-between text-sm shadow-minimal font-medium ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-surface-100 border border-surface-200 text-surface-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="leading-relaxed">{opt}</span>
                      </div>

                      {isAnswered && isCorrectOption && (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 ml-2 stroke-[1.5]" />
                      )}
                      {isAnswered && isSelected && !qState.isCorrect && (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0 ml-2 stroke-[1.5]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Educational Feedback Box */}
              {qState && (
                <div
                  className={`p-5 rounded-2xl border text-sm leading-relaxed space-y-2 animate-fadeIn shadow-minimal ${
                    qState.isCorrect
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {qState.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600 stroke-[1.5]" />
                        <span>Spot on! Recorded in your profile.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600 stroke-[1.5]" />
                        <span>Not quite, but here is what to remember:</span>
                      </>
                    )}
                  </div>
                  <p className="pl-6 font-medium">
                    {currentQ.explanation}
                  </p>
                </div>
              )}
            </>
          ) : null}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-surface-200 mt-2">
            <button
              onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
              disabled={currentQIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-surface-500 hover:text-surface-900 hover:bg-surface-50 transition disabled:opacity-30 disabled:hover:bg-transparent"
            >
              Previous Question
            </button>

            <div className="flex items-center gap-3">
              {currentQIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQIndex(currentQIndex + 1)}
                  className="px-5 py-2.5 bg-surface-900 hover:bg-surface-800 text-white font-semibold text-sm rounded-xl transition flex items-center gap-2 shadow-minimal"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4 stroke-[1.5]" />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRetakeQuiz}
                    className="px-4 py-2.5 bg-white border border-surface-200 hover:bg-surface-50 text-surface-900 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-minimal"
                  >
                    <RotateCcw className="w-4 h-4 stroke-[1.5]" />
                    <span>Retake Quiz (New Round)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('simulator')}
                    className="px-5 py-2.5 bg-surface-900 hover:bg-surface-800 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-2 shadow-minimal"
                  >
                    <span>Practice in Simulator</span>
                    <ArrowRight className="w-4 h-4 stroke-[1.5]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Practice Simulator Section */}
      {activeTab === 'simulator' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-200 space-y-8 shadow-minimal">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-surface-900 stroke-[1.5]" />
                <h2 className="text-xl font-bold text-surface-900">Safe Practice Investing Simulator</h2>
              </div>
              <p className="text-sm text-surface-600 leading-relaxed font-medium mt-1">
                Allocate your earned Mind Coins into a sample asset and test what happens during different market conditions. Saved to Supabase database.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Controls: Asset, Coins, Scenario (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Pick Asset */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-surface-500">
                    1. Choose Sample Asset to Simulate:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {assets.slice(0, 6).map(a => {
                      const r = calculateRiskLevel(a);
                      const isSel = a.id === selectedAssetId;
                      return (
                         <button
                          key={a.id}
                          onClick={() => setSelectedAssetId(a.id)}
                          className={`p-4 rounded-xl text-left border transition flex flex-col justify-between shadow-minimal ${
                            isSel
                              ? 'bg-surface-900 border-surface-900 text-white'
                              : 'bg-white border-surface-200 text-surface-600 hover:border-surface-300 hover:bg-surface-50'
                          }`}
                        >
                          <span className={`font-bold text-sm block ${isSel ? 'text-white' : 'text-surface-900'}`}>{a.name}</span>
                          <div className={`flex items-center justify-between mt-3 pt-2 border-t text-[10px] ${isSel ? 'border-surface-700' : 'border-surface-100'}`}>
                            <span className="font-mono">{a.symbol}</span>
                            <span className={`font-bold ${isSel ? 'text-surface-300' : r.textColor}`}>{r.level} Risk</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Allocate Coins */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-surface-500">
                      2. Allocate Practice Coins:
                    </label>
                    <span className="text-xs text-surface-700 font-bold bg-surface-100 px-2 py-1 rounded-md border border-surface-200">
                      Available: {coins}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="10"
                      max={coins}
                      value={coinAllocation}
                      onChange={(e) => setCoinAllocation(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-32 px-4 py-3 bg-white border border-surface-200 rounded-xl text-base font-bold text-surface-900 focus:outline-none focus:ring-2 focus:ring-surface-900 focus:border-transparent shadow-minimal"
                    />

                    {/* Presets */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {[25, 50, 100].map(val => (
                        <button
                          key={val}
                          onClick={() => setCoinAllocation(Math.min(coins, val))}
                          disabled={coins < val}
                          className="px-3 py-1.5 rounded-lg bg-white text-xs font-medium text-surface-600 hover:text-surface-900 border border-surface-200 disabled:opacity-40 shadow-minimal transition"
                        >
                          {val}
                        </button>
                      ))}
                      <button
                        onClick={() => setCoinAllocation(coins)}
                        disabled={coins <= 0}
                        className="px-3 py-1.5 rounded-lg bg-surface-900 text-xs font-semibold text-white border border-surface-900 disabled:opacity-40 shadow-minimal transition hover:bg-surface-800"
                      >
                        Max ({coins})
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Market Scenario */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-surface-500">
                    3. Select Market Simulation Scenario:
                  </label>
                  <div className="space-y-3">
                    {[
                      {
                        id: 'historical_sample',
                        title: 'Real 1-Year Historical Sample Data',
                        desc: 'Tests asset returns using static monthly historical data recorded for this asset.'
                      },
                      {
                        id: 'bull_market',
                        title: 'Economic Bull Market Surge (+14% baseline)',
                        desc: 'Economic boom: tech and high beta assets usually surge higher than defensive bonds.'
                      },
                      {
                        id: 'market_correction',
                        title: 'Market Correction & Bear Dip (-12% baseline)',
                        desc: 'Recession worries test your holding discipline and resilience.'
                      },
                      {
                        id: 'inflation_cycle',
                        title: 'High Inflation & Rate Hike Cycle',
                        desc: 'Tests how pricing power and bonds withstand shifting interest rate regimes.'
                      },
                      {
                        id: 'compound_5yr',
                        title: '5-Year Compound Growth Cycle',
                        desc: 'Demonstrates the power of patience across multiple years of uninterrupted growth.'
                      }
                    ].map(scen => (
                       <button
                        key={scen.id}
                        onClick={() => setSimulationScenario(scen.id)}
                        className={`w-full p-4 rounded-xl text-left border transition flex items-start justify-between shadow-minimal ${
                          simulationScenario === scen.id
                            ? 'bg-surface-900 border-surface-900 text-white'
                            : 'bg-white border-surface-200 text-surface-600 hover:border-surface-300 hover:bg-surface-50'
                        }`}
                      >
                        <div>
                          <span className={`font-bold text-sm block ${simulationScenario === scen.id ? 'text-white' : 'text-surface-900'}`}>{scen.title}</span>
                          <span className={`text-xs mt-1 block font-medium ${simulationScenario === scen.id ? 'text-surface-300' : 'text-surface-500'}`}>{scen.desc}</span>
                        </div>
                        {simulationScenario === scen.id && (
                          <span className="w-2.5 h-2.5 rounded-full bg-white mt-1 shrink-0 shadow-sm" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulation CTA Button */}
                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating || coinAllocation <= 0 || coinAllocation > coins}
                  className="w-full py-4 px-6 bg-surface-900 hover:bg-surface-800 text-white font-bold text-sm rounded-xl shadow-minimal transition flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Play className="w-4 h-4 fill-white stroke-[1.5]" />
                  <span>{isSimulating ? 'Simulating & Saving to Supabase...' : `Simulate with ${coinAllocation} Coins`}</span>
                </button>
              </div>

              {/* Right Panel: Simulation Output / Results (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-surface-50 rounded-2xl p-6 border border-surface-200 space-y-6 shadow-minimal">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-surface-500 block">
                      Simulation Outcome
                    </span>
                    <span className="text-[10px] text-surface-600 bg-white px-2 py-0.5 rounded border border-surface-200 font-semibold shadow-minimal">
                      Auto-saved to DB
                    </span>
                  </div>

                  {isSimulating ? (
                    <div className="py-16 text-center space-y-4">
                      <div className="w-10 h-10 border-4 border-surface-900 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-sm font-bold text-surface-600">
                        Processing volatility curves for {selectedSimAsset?.symbol}...
                      </p>
                    </div>
                  ) : simulationResult ? (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Before vs After Counter */}
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-minimal">
                          <span className="text-[10px] uppercase font-bold text-surface-400 block mb-1">Allocated</span>
                          <span className="text-2xl font-bold text-surface-900 block">
                            {simulationResult.startingCoins}
                          </span>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-minimal">
                          <span className="text-[10px] uppercase font-bold text-surface-400 block mb-1">Simulated Value</span>
                          <span className={`text-2xl font-bold block ${simulationResult.netGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {simulationResult.endingCoins}
                          </span>
                        </div>
                      </div>

                      {/* Net Gain/Loss Pill */}
                      <div className={`p-4 rounded-xl border text-center font-bold text-sm flex items-center justify-center gap-2 shadow-minimal ${
                        simulationResult.netGain >= 0
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {simulationResult.netGain >= 0 ? <TrendingUp className="w-5 h-5 stroke-[1.5]" /> : <TrendingDown className="w-5 h-5 stroke-[1.5]" />}
                        <span>
                          Net Result: {simulationResult.netGain >= 0 ? `+${simulationResult.netGain}` : simulationResult.netGain} ({simulationResult.returnPct >= 0 ? `+${simulationResult.returnPct}` : simulationResult.returnPct}%)
                        </span>
                      </div>

                      {/* Pedagogical Lesson Card */}
                      <div className="p-5 rounded-xl bg-white border border-surface-200 space-y-2 text-sm shadow-minimal">
                        <div className="flex items-center gap-2 text-surface-900 font-bold">
                          <Lightbulb className="w-5 h-5 stroke-[1.5]" />
                          <span>Pedagogical Takeaway:</span>
                        </div>
                        <p className="text-surface-600 leading-relaxed font-medium">
                          {simulationResult.lesson}
                        </p>
                      </div>

                      {/* Cash out / Collect button */}
                      <button
                        onClick={handleCashOutSimulator}
                        className="w-full py-3.5 px-4 bg-surface-900 hover:bg-surface-800 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-minimal"
                      >
                        <Coins className="w-5 h-5 stroke-[1.5]" />
                        <span>Collect {simulationResult.endingCoins} Coins to Wallet</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-16 px-4 space-y-3 text-surface-500">
                      <Coins className="w-10 h-10 text-surface-300 mx-auto mb-2 stroke-[1.5]" />
                      <p className="text-sm font-medium leading-relaxed max-w-xs mx-auto">
                        Configure your coin allocation and scenario on the left, then click Simulate to observe returns and save to your practice portfolio.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Database Practice Portfolio & Investment History */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-200 space-y-6 shadow-minimal">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-surface-900 stroke-[1.5]" />
                <h3 className="text-lg font-bold text-surface-900">Your Simulated Portfolio & Investment History</h3>
              </div>
              <span className="text-xs font-semibold text-surface-600 bg-surface-50 px-3 py-1.5 rounded-full border border-surface-200 shadow-minimal">
                {investments.length} Recorded Simulation{investments.length === 1 ? '' : 's'}
              </span>
            </div>

            {investments.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-surface-200 shadow-minimal">
                <table className="w-full text-left text-sm">
                  <thead className="text-[11px] uppercase font-bold text-surface-500 border-b border-surface-200 bg-surface-50">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold tracking-wider">Asset</th>
                      <th className="py-3.5 px-4 font-semibold tracking-wider">Coins Invested</th>
                      <th className="py-3.5 px-4 font-semibold tracking-wider">Simulated Value</th>
                      <th className="py-3.5 px-4 font-semibold tracking-wider">Net Gain / Loss</th>
                      <th className="py-3.5 px-4 font-semibold tracking-wider">Scenario</th>
                      <th className="py-3.5 px-4 font-semibold tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200 font-medium bg-white">
                    {investments.map((inv) => {
                      const pl = parseFloat(inv.profit_loss || 0);
                      const isPositive = pl >= 0;
                      const invested = parseFloat(inv.coins_invested || 0);
                      const ending = invested + pl;
                      return (
                        <tr key={inv.id} className="hover:bg-surface-50 transition">
                          <td className="py-3 px-4 font-bold text-surface-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-surface-900" />
                            <span>{inv.asset_name || inv.asset_id}</span>
                          </td>
                          <td className="py-3 px-4 text-surface-600">{invested}</td>
                          <td className="py-3 px-4 font-bold text-surface-900">{ending}</td>
                          <td className="py-3 px-4 font-bold">
                            <span className={`px-2.5 py-1 rounded-md text-xs border ${isPositive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                              {isPositive ? `+${pl}` : pl}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-surface-500 capitalize text-xs">
                            {(inv.scenario || 'historical_sample').replace('_', ' ')}
                          </td>
                          <td className="py-3 px-4 text-surface-400 text-xs">
                            {new Date(inv.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-surface-500 text-sm border-2 border-dashed border-surface-200 rounded-2xl bg-surface-50">
                <Layers className="w-8 h-8 mx-auto mb-3 text-surface-400 stroke-[1.5]" />
                <p className="font-semibold text-surface-700">No simulated investments recorded yet.</p>
                <p className="text-xs text-surface-500 mt-1 max-w-sm mx-auto">Allocate coins above to start building your simulated portfolio history!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

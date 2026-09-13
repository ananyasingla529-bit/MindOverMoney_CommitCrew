import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Bot, 
  User, 
  Send, 
  RotateCcw, 
  Sparkles, 
  Target, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Bookmark, 
  ArrowRight, 
  SlidersHorizontal,
  HelpCircle,
  Award,
  MessageSquareText
} from 'lucide-react';
import { getAssets } from '../services/assetsService';
import { askAssetCoach } from '../services/aiService';
import { useApp } from '../context/AppContext';

export default function Decide() {
  const [searchParams] = useSearchParams();
  const initialAssetId = searchParams.get('asset') || 'vanguard-sp500-etf';

  // Smart Tab Priority:
  // 1. If user clicked "Decide Fit" on an asset (?asset=... or ?tab=fit) -> Open 'fit' (Guided Fit Evaluator)
  // 2. If user clicked "AI Coach" from main sidebar (/decide) -> Open 'chat' (Real-Time AI Chatbot)
  const explicitTab = searchParams.get('tab');
  const hasAssetParam = Boolean(searchParams.get('asset'));
  const initialTab = explicitTab ? (explicitTab === 'fit' ? 'fit' : 'chat') : (hasAssetParam ? 'fit' : 'chat');

  const { saveDecision, toggleBookmark, bookmarkedAssets } = useApp();

  const [activeTab, setActiveTab] = useState(initialTab); // 'chat' | 'fit'
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState(initialAssetId);

  // Questionnaire state
  const [answers, setAnswers] = useState({
    horizon: '3_5_years',
    emergencyFund: '3_months',
    riskTolerance: 'moderate',
    goal: 'growth'
  });

  const [verdictResult, setVerdictResult] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Chatbot state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const data = await getAssets();
      if (isMounted) {
        setAssets(data);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const selectedAsset = useMemo(() => {
    if (selectedAssetId === 'all') return assets[0] || null;
    return assets.find(a => a.id === selectedAssetId) || assets[0] || null;
  }, [assets, selectedAssetId]);

  // Handle asset changes from URL query params
  useEffect(() => {
    const paramAsset = searchParams.get('asset');
    if (paramAsset) {
      setSelectedAssetId(paramAsset);
    }
    const tabParam = searchParams.get('tab');
    if (tabParam === 'fit' || paramAsset) {
      setActiveTab(tabParam === 'chat' ? 'chat' : 'fit');
    }
  }, [searchParams]);

  // Recalculate verdict when questionnaire answers or selected asset change
  useEffect(() => {
    if (!selectedAsset) return;

    let score = 100;
    const reasons = [];
    const warnings = [];

    // 1. Time Horizon vs Volatility
    const isHighVolatility = (selectedAsset.volatility || 15) > 25 || selectedAsset.riskLevel === 'High';
    if (answers.horizon === 'under_1_year') {
      if (isHighVolatility) {
        score -= 40;
        warnings.push(`Short time horizon (<1 yr) is dangerous for high-volatility assets like ${selectedAsset.name}.`);
      } else {
        score -= 20;
        warnings.push(`Short time horizons may not give index/stock funds enough time to recover from short-term market dips.`);
      }
    } else if (answers.horizon === '1_3_years') {
      if (isHighVolatility) {
        score -= 25;
        warnings.push(`High volatility assets perform best with 5+ year holding horizons.`);
      } else {
        reasons.push(`1–3 year horizon allows modest compounding, though 5+ years is optimal.`);
      }
    } else {
      reasons.push(`Long-term horizon (3–5+ years) allows your investment to ride out market cycles and compound effectively.`);
    }

    // 2. Emergency Cushion
    if (answers.emergencyFund === 'none') {
      score -= 35;
      warnings.push(`You do not have an emergency cash buffer. Investing before saving 3+ months of expenses risks forcing you to sell at a loss during emergencies.`);
    } else if (answers.emergencyFund === '1_2_months') {
      score -= 10;
      reasons.push(`1-2 months emergency savings is a start, but building up to 3–6 months will protect your investments.`);
    } else {
      reasons.push(`Strong emergency cushion protects you from needing to panic-sell investments during unexpected life events.`);
    }

    // 3. Risk Tolerance vs Asset Risk
    if (answers.riskTolerance === 'low') {
      if (selectedAsset.riskLevel === 'High') {
        score -= 30;
        warnings.push(`${selectedAsset.name} has High volatility, which contrasts with your conservative risk preference.`);
      } else if (selectedAsset.riskLevel === 'Medium') {
        score -= 10;
        reasons.push(`${selectedAsset.name} carries moderate price swings.`);
      } else {
        reasons.push(`Low-risk asset aligns well with your cautious risk tolerance.`);
      }
    } else if (answers.riskTolerance === 'high') {
      reasons.push(`High risk tolerance matches the growth profile of this asset.`);
    } else {
      reasons.push(`Balanced risk tolerance fits well with broad market diversification.`);
    }

    const finalScore = Math.max(15, Math.min(100, score));

    let status = 'STRONG FIT';
    let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    let icon = CheckCircle2;

    if (finalScore < 55) {
      status = 'HIGH RISK / POOR FIT';
      badgeColor = 'bg-red-50 text-red-700 border-red-200';
      icon = XCircle;
    } else if (finalScore < 80) {
      status = 'MODERATE FIT / PROCEED WITH CAUTION';
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
      icon = AlertTriangle;
    }

    setVerdictResult({
      score: finalScore,
      status,
      badgeColor,
      icon,
      reasons,
      warnings
    });
  }, [selectedAsset, answers]);

  // Initial welcome message for Chatbot
  useEffect(() => {
    const assetName = selectedAsset ? `${selectedAsset.name} (${selectedAsset.symbol})` : 'General Investing';
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: `👋 **Welcome to your Real-Time Financial AI Coach!**\n\nAsk me anything about **${assetName}**, risk metrics, expense ratios, dividends, or how to get started as a first-time investor.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [selectedAssetId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, loading, activeTab]);

  const handleSend = async (customText) => {
    const q = (customText || input).trim();
    if (!q || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await askAssetCoach({
        asset: selectedAsset,
        question: q,
        history: messages
      });

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.text,
        isFallback: res.isFallback,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: '⚠️ I encountered a temporary connection issue. Please try again!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDecision = () => {
    if (!selectedAsset || !verdictResult) return;
    saveDecision({
      assetId: selectedAsset.id,
      assetName: selectedAsset.name,
      symbol: selectedAsset.symbol,
      fitScore: verdictResult.score,
      verdict: verdictResult.status,
      summary: verdictResult.reasons.join(' ')
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const isBookmarked = selectedAsset ? bookmarkedAssets.includes(selectedAsset.id) : false;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 font-sans">
      {/* Header Bar & Mode Selector */}
      <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-minimal flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-surface-900 text-white shadow-minimal">
              <Bot className="w-5 h-5 stroke-[1.5]" />
            </span>
            <h1 className="text-xl font-bold text-surface-900">
              {activeTab === 'fit' ? 'Guided Fit Evaluator' : 'Real-Time AI Coach'}
            </h1>
          </div>
          <p className="text-xs text-surface-500 font-medium mt-1">
            Evaluate personalized investment suitability or chat real-time with your AI mentor
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-surface-100 p-1 rounded-xl border border-surface-200 shrink-0">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'chat'
                ? 'bg-surface-900 text-white shadow-minimal'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            <MessageSquareText className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>AI Chatbot</span>
          </button>

          <button
            onClick={() => setActiveTab('fit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'fit'
                ? 'bg-surface-900 text-white shadow-minimal'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Guided Fit Evaluator</span>
          </button>
        </div>
      </div>

      {/* Asset Selector Header */}
      <div className="bg-surface-900 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white text-sm border border-white/10">
            {selectedAsset?.symbol || 'FIN'}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-surface-300">Active Asset Context</span>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <span>{selectedAsset?.name || 'Select an Asset'}</span>
              {selectedAsset && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white font-semibold">
                  {selectedAsset.category?.toUpperCase()}
                </span>
              )}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Asset Dropdown Selector */}
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="bg-surface-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl border border-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {assets.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.symbol})
              </option>
            ))}
          </select>

          {selectedAsset && (
            <button
              onClick={() => toggleBookmark(selectedAsset.id)}
              className={`p-2.5 rounded-xl border transition ${
                isBookmarked
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-surface-800 text-surface-300 hover:text-white border-surface-700'
              }`}
              title="Bookmark Asset"
            >
              <Bookmark className="w-4 h-4 stroke-[1.5]" />
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: REAL-TIME AI COACH CHATBOT */}
      {activeTab === 'chat' && (
        <div className="bg-white border border-surface-200 rounded-2xl shadow-minimal overflow-hidden flex flex-col h-[650px]">
          {/* Quick Fit Evaluator Notice Banner */}
          <div className="bg-surface-50 border-b border-surface-200 px-4 py-2.5 flex items-center justify-between text-xs text-surface-600 font-medium">
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 stroke-[1.5]" />
              <span>Real-Time AI Chatbot active for <strong>{selectedAsset?.name || 'General Finance'}</strong></span>
            </span>
            <button
              onClick={() => setActiveTab('fit')}
              className="text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1 transition"
            >
              <span>Guided Fit Evaluator</span>
              <ArrowRight className="w-3 h-3 stroke-[1.5]" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-surface-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-minimal ${
                    msg.sender === 'user'
                      ? 'bg-surface-900 text-white'
                      : 'bg-white text-surface-900 border border-surface-200'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-brand-600" />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-minimal ${
                    msg.sender === 'user'
                      ? 'bg-surface-900 text-white font-medium rounded-tr-none'
                      : 'bg-white text-surface-900 border border-surface-200 rounded-tl-none font-normal'
                  }`}
                >
                  <div className="prose prose-xs max-w-none text-inherit">
                    {msg.text.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-2 last:mb-0">
                        {paragraph.split('**').map((chunk, cIdx) =>
                          cIdx % 2 === 1 ? (
                            <strong key={cIdx} className="font-bold text-inherit">{chunk}</strong>
                          ) : (
                            chunk
                          )
                        )}
                      </p>
                    ))}
                  </div>
                  <div
                    className={`text-[10px] mt-2 font-medium ${
                      msg.sender === 'user' ? 'text-surface-400 text-right' : 'text-surface-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                <div className="w-8 h-8 rounded-xl bg-white border border-surface-200 flex items-center justify-center text-brand-600">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 bg-white border border-surface-200 rounded-2xl text-xs text-surface-500 font-medium animate-pulse">
                  Analyzing financial principles...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          <div className="p-3 bg-white border-t border-surface-200 overflow-x-auto flex gap-2">
            {[
              `Is ${selectedAsset?.symbol || 'this asset'} safe for beginners?`,
              `How does volatility affect ${selectedAsset?.symbol || 'stocks'}?`,
              `What is the difference between Stocks, ETFs, and Crypto?`,
              `How do I start investing with $100?`
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap text-xs font-semibold py-1.5 px-3 rounded-lg bg-surface-100 hover:bg-surface-200 text-surface-700 transition"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-4 bg-white border-t border-surface-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask any question about ${selectedAsset?.name || 'investing'}...`}
                className="flex-1 py-3 px-4 rounded-xl bg-surface-50 border border-surface-200 text-surface-900 placeholder-surface-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-3 rounded-xl bg-surface-900 hover:bg-surface-800 text-white disabled:opacity-40 transition shadow-minimal"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: GUIDED FIT EVALUATOR (QUESTIONNAIRE & VERDICT) */}
      {activeTab === 'fit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Questionnaire Input Panel */}
          <div className="lg:col-span-6 bg-white border border-surface-200 rounded-2xl p-6 space-y-5 shadow-minimal">
            <div>
              <h3 className="text-base font-bold text-surface-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-600 stroke-[1.5]" />
                <span>Your Investment Profile Quiz</span>
              </h3>
              <p className="text-xs text-surface-500 font-medium mt-1">
                Answer these 4 questions to evaluate if {selectedAsset?.name || 'this asset'} fits your financial situation.
              </p>
            </div>

            {/* Q1: Time Horizon */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-surface-700">
                1. How long do you plan to hold this investment?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'under_1_year', label: '< 1 Year (Short Term)' },
                  { id: '1_3_years', label: '1 – 3 Years (Medium)' },
                  { id: '3_5_years', label: '3 – 5 Years (Long)' },
                  { id: '5_plus_years', label: '5+ Years (Very Long)' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setAnswers(prev => ({ ...prev, horizon: item.id }))}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-xl border text-left transition ${
                      answers.horizon === item.id
                        ? 'bg-surface-900 text-white border-surface-900 shadow-minimal'
                        : 'bg-surface-50 text-surface-700 border-surface-200 hover:bg-surface-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q2: Emergency Fund */}
            <div className="space-y-2 pt-2 border-t border-surface-100">
              <label className="block text-xs font-bold text-surface-700">
                2. What is your current liquid emergency cash cushion?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'No buffer yet' },
                  { id: '1_2_months', label: '1–2 months' },
                  { id: '3_months', label: '3–6+ months' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setAnswers(prev => ({ ...prev, emergencyFund: item.id }))}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-xl border text-center transition ${
                      answers.emergencyFund === item.id
                        ? 'bg-surface-900 text-white border-surface-900 shadow-minimal'
                        : 'bg-surface-50 text-surface-700 border-surface-200 hover:bg-surface-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q3: Risk Tolerance */}
            <div className="space-y-2 pt-2 border-t border-surface-100">
              <label className="block text-xs font-bold text-surface-700">
                3. How do you react if your portfolio value drops 15% in a month?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'low', label: 'I panic & sell' },
                  { id: 'moderate', label: 'Nervous but hold' },
                  { id: 'high', label: 'Buy more at a discount' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setAnswers(prev => ({ ...prev, riskTolerance: item.id }))}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-xl border text-center transition ${
                      answers.riskTolerance === item.id
                        ? 'bg-surface-900 text-white border-surface-900 shadow-minimal'
                        : 'bg-surface-50 text-surface-700 border-surface-200 hover:bg-surface-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q4: Financial Goal */}
            <div className="space-y-2 pt-2 border-t border-surface-100">
              <label className="block text-xs font-bold text-surface-700">
                4. What is your primary objective for this money?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'preservation', label: 'Capital Safety' },
                  { id: 'growth', label: 'Balanced Growth' },
                  { id: 'aggressive', label: 'Max Return' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setAnswers(prev => ({ ...prev, goal: item.id }))}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-xl border text-center transition ${
                      answers.goal === item.id
                        ? 'bg-surface-900 text-white border-surface-900 shadow-minimal'
                        : 'bg-surface-50 text-surface-700 border-surface-200 hover:bg-surface-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Verdict Output Panel */}
          <div className="lg:col-span-6 space-y-5">
            {verdictResult && (
              <div className="bg-white border border-surface-200 rounded-2xl p-6 space-y-5 shadow-minimal">
                {/* Verdict Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-brand-600 stroke-[1.5]" />
                    <span className="font-bold text-surface-900 text-sm">Personalized Verdict</span>
                  </div>
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${verdictResult.badgeColor}`}>
                    {verdictResult.status}
                  </span>
                </div>

                {/* Score Gauge Meter */}
                <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-surface-500 font-bold uppercase tracking-wider">Suitability Fit Score</p>
                    <p className="text-2xl font-black text-surface-900 mt-0.5">{verdictResult.score} / 100</p>
                  </div>
                  <div className="w-32 h-3 bg-surface-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        verdictResult.score >= 80 ? 'bg-emerald-500' : verdictResult.score >= 55 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${verdictResult.score}%` }}
                    />
                  </div>
                </div>

                {/* Reasons Breakdown */}
                {verdictResult.reasons.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-surface-700 uppercase tracking-wider">Key Fit Indicators</p>
                    <ul className="space-y-2">
                      {verdictResult.reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-surface-700 leading-relaxed font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 stroke-[1.5]" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {verdictResult.warnings.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-surface-100">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span>Important Risk Considerations</span>
                    </p>
                    <ul className="space-y-2">
                      {verdictResult.warnings.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200 leading-relaxed font-medium">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 stroke-[1.5]" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Save Decision Button */}
                <div className="pt-3 border-t border-surface-100 flex items-center justify-between">
                  <button
                    onClick={handleSaveDecision}
                    className="w-full py-3 px-4 rounded-xl bg-surface-900 hover:bg-surface-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-minimal"
                  >
                    <Bookmark className="w-4 h-4 stroke-[1.5]" />
                    <span>{savedSuccess ? 'Decision Saved to Profile! ✓' : 'Save Decision Analysis to Profile'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

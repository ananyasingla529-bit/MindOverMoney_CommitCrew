import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Bot, 
  User, 
  Send, 
  RotateCcw, 
  Sparkles, 
  Lightbulb, 
  Key, 
  ShieldCheck, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { getAssets } from '../services/assetsService';
import { askAssetCoach } from '../services/aiService';
import { useApp } from '../context/AppContext';

export default function Decide() {
  const [searchParams] = useSearchParams();
  const initialAssetId = searchParams.get('asset') || 'all';
  const { geminiApiKey } = useApp();

  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState(initialAssetId);
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
    if (selectedAssetId === 'all') return null;
    return assets.find(a => a.id === selectedAssetId) || null;
  }, [assets, selectedAssetId]);

  // Initial welcome message
  useEffect(() => {
    const assetName = selectedAsset ? `${selectedAsset.name} (${selectedAsset.symbol})` : 'General Financial Concepts';
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: `👋 **Welcome to your Real-Time Financial AI Coach!**\n\nAsk me anything about **${assetName}**, risk metrics, expense ratios, dividends, or how to get started as a first-time investor. Type your question below or tap one of the suggested prompts!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [selectedAssetId]);

  const suggestedQuestions = useMemo(() => {
    if (selectedAsset) {
      return [
        `Is ${selectedAsset.symbol} safe for an absolute beginner?`,
        `What happens if the stock market crashes while I hold ${selectedAsset.symbol}?`,
        `Does ${selectedAsset.name} pay regular dividends?`,
        `What is the expense ratio and risk level for ${selectedAsset.symbol}?`
      ];
    }
    return [
      `How do I start investing with $100 as a beginner?`,
      `What is the difference between Stocks, ETFs, and Crypto?`,
      `How does risk level and Beta metric work?`,
      `What is an emergency fund and why do I need one first?`
    ];
  }, [selectedAsset]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
      const response = await askAssetCoach({
        asset: selectedAsset,
        question: q,
        history: messages,
        apiKey: geminiApiKey
      });

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.text,
        isFallback: response.isFallback,
        scopedRefusal: response.scopedRefusal,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `Sorry, I encountered an issue analyzing that question. Please ask again or select one of the suggested prompts below!`,
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    const assetName = selectedAsset ? `${selectedAsset.name} (${selectedAsset.symbol})` : 'General Financial Concepts';
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: `👋 **Chat Reset.** Ask me any question about **${assetName}** or general beginner investing!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn font-sans pb-10">
      {/* Page Title & Scope Selector Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-200 shadow-minimal space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-50 border border-surface-200 text-surface-600 text-xs font-bold shadow-minimal mb-2">
              <Sparkles className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Real-Time AI Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 tracking-tight">
              Ask Any Question in Real Time
            </h1>
            <p className="text-sm text-surface-600 mt-1 font-medium">
              Get instant, plain-English answers about assets, risks, dividends, and market concepts.
            </p>
          </div>

          {/* Scope Dropdown */}
          <div className="w-full sm:w-64 shrink-0">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-1.5">
              Focus Topic / Asset Scope:
            </label>
            <div className="relative">
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3.5 py-2.5 text-sm text-surface-900 font-bold focus:outline-none focus:ring-2 focus:ring-surface-900 transition appearance-none cursor-pointer pr-10 shadow-minimal"
              >
                <option value="all">🌐 General Financial Literacy</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.symbol})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-surface-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.5]" />
            </div>
          </div>
        </div>

        {/* Real-time Status Badge Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-surface-100 text-xs">
          <div className="flex items-center gap-2 text-surface-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Real-Time Chat Active</span>
          </div>

          <div className="text-[11px] text-surface-500 font-medium">
            {geminiApiKey ? (
              <span className="text-green-700 font-bold bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                ⚡ Gemini Live AI Connected
              </span>
            ) : (
              <span className="text-surface-600 font-semibold bg-surface-100 px-2.5 py-1 rounded-full border border-surface-200">
                💡 Smart Tutor Engine Active (No API Key required)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Chatbot Interface */}
      <div className="bg-white rounded-3xl border border-surface-200 flex flex-col h-[600px] shadow-minimal overflow-hidden">
        {/* Chatbot Header */}
        <div className="px-6 py-4 bg-surface-50 border-b border-surface-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-900 flex items-center justify-center text-white shadow-minimal">
              <Bot className="w-5 h-5 text-white stroke-[1.5]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-surface-900">
                {selectedAsset ? `${selectedAsset.name} Tutor` : 'Mind Over Money AI Coach'}
              </h3>
              <p className="text-[11px] text-surface-500 font-medium">
                Instant Real-Time Q&A
              </p>
            </div>
          </div>

          <button
            onClick={resetChat}
            className="px-3 py-1.5 rounded-xl text-surface-600 hover:text-surface-900 hover:bg-white border border-surface-200 transition text-xs flex items-center gap-1.5 font-bold shadow-minimal"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Reset Chat</span>
          </button>
        </div>

        {/* Messages Scroll Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold border ${
                  msg.sender === 'user'
                    ? 'bg-surface-900 text-white border-surface-900'
                    : 'bg-surface-50 text-surface-700 border-surface-200'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4 stroke-[1.5]" /> : <Bot className="w-4 h-4 stroke-[1.5]" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-surface-900 text-white rounded-tr-sm font-medium shadow-minimal'
                    : msg.scopedRefusal
                    ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-sm font-medium'
                    : 'bg-surface-50 border border-surface-200 text-surface-800 rounded-tl-sm shadow-minimal font-medium'
                }`}
              >
                <div className="whitespace-pre-line space-y-2">
                  {msg.text.split('\n\n').map((paragraph, i) => (
                    <p key={i}>
                      {paragraph.split('**').map((chunk, j) =>
                        j % 2 === 1 ? (
                          <strong key={j} className={msg.sender === 'user' ? 'font-bold text-white' : 'font-bold text-surface-900'}>
                            {chunk}
                          </strong>
                        ) : (
                          chunk
                        )
                      )}
                    </p>
                  ))}
                </div>

                <div className={`mt-2 flex items-center justify-between text-[10px] pt-2 border-t ${msg.sender === 'user' ? 'border-white/20 text-surface-300' : 'border-surface-200 text-surface-400'}`}>
                  <span className="font-semibold">{msg.timestamp}</span>
                  {msg.sender === 'bot' && (
                    <span className="font-bold">
                      {msg.isFallback ? 'Instant Tutor Engine' : 'Live AI Response'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-surface-50 text-surface-700 border border-surface-200 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 animate-spin stroke-[1.5]" />
              </div>
              <div className="bg-surface-50 border border-surface-200 rounded-2xl rounded-tl-sm px-5 py-3.5 text-xs text-surface-600 flex items-center gap-2 shadow-minimal">
                <div className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-surface-400 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-surface-400 animate-bounce delay-200" />
                <span className="ml-2 font-bold text-surface-800">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-6 py-3 bg-white border-t border-surface-200 space-y-2">
          <span className="text-[10px] uppercase font-bold text-surface-500 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Quick Prompts:</span>
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {suggestedQuestions.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sq)}
                disabled={loading}
                className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-surface-50 hover:bg-surface-100 text-surface-700 hover:text-surface-900 border border-surface-200 whitespace-nowrap transition shrink-0 disabled:opacity-50 shadow-minimal"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-5 bg-surface-50 border-t border-surface-200">
          <div className="flex items-center gap-2 bg-white border border-surface-300 rounded-2xl px-4 py-2 focus-within:border-surface-900 transition shadow-minimal">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder={selectedAsset ? `Ask anything about ${selectedAsset.symbol}...` : "Ask any financial question..."}
              className="flex-1 bg-transparent text-sm text-surface-900 placeholder-surface-400 focus:outline-none py-1.5 font-medium"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-surface-900 hover:bg-surface-800 text-white font-bold disabled:opacity-40 transition shadow-minimal"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

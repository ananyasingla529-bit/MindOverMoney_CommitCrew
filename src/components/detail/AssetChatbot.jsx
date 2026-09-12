import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  HelpCircle, 
  Bot, 
  User, 
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { askAssetCoach } from '../../services/aiService';
import { useApp } from '../../context/AppContext';

export default function AssetChatbot({ asset }) {
  const { geminiApiKey } = useApp();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `👋 **Welcome!** I am your dedicated **Mind Over Money** coach for **${asset.name} (${asset.symbol})**.\n\nI am strictly scoped to help you understand this asset's risk profile, fees, jargon, and general beginner investing concepts. Ask me any question below, or tap one of the suggested prompts!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = asset.suggestedQuestions || [
    `Is ${asset.symbol} safe for an absolute beginner?`,
    `What happens if the stock market crashes while I own this?`,
    `How does this asset pay me money?`,
    `What is a safe allocation percentage for this asset?`
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await askAssetCoach({
        asset,
        question: q,
        history: messages,
        apiKey: geminiApiKey
      });

      const botMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.text,
        isFallback: response.isFallback,
        scopedRefusal: response.scopedRefusal,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `Sorry, I encountered an issue analyzing this question. Please try asking again or tap one of the suggested prompts!`,
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
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: `👋 Chat reset. Ask anything about **${asset.name} (${asset.symbol})** or general first-time investing literacy!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="bg-white rounded-2xl border border-surface-200 flex flex-col h-[640px] shadow-minimal overflow-hidden font-sans">
      {/* Chatbot Header */}
      <div className="px-5 py-4 bg-surface-50 border-b border-surface-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-900 flex items-center justify-center text-white shadow-minimal">
            <Bot className="w-5 h-5 text-white stroke-[1.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-surface-900">{asset.symbol} Tutor</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-100 text-surface-600 border border-surface-200">
                Scoped Topic
              </span>
            </div>
            <p className="text-[11px] text-surface-500 font-medium mt-0.5">
              {geminiApiKey ? 'Powered by AI' : 'Smart Fallback Active'}
            </p>
          </div>
        </div>

        <button
          onClick={resetChat}
          className="p-2 rounded-lg text-surface-500 hover:text-surface-900 hover:bg-white border border-transparent hover:border-surface-200 transition text-xs flex items-center gap-1 shadow-none hover:shadow-minimal"
          title="Restart Conversation"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[1.5]" />
          <span className="hidden sm:inline font-semibold">Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 text-xs font-bold border ${
                msg.sender === 'user'
                  ? 'bg-surface-900 text-white border-surface-900'
                  : 'bg-surface-50 text-surface-600 border-surface-200'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4 stroke-[1.5]" /> : <Bot className="w-4 h-4 stroke-[1.5]" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-surface-100 text-surface-900 rounded-tr-sm border border-surface-200 font-medium'
                  : msg.scopedRefusal
                  ? 'bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-tl-sm font-medium'
                  : 'bg-white border border-surface-200 text-surface-700 rounded-tl-sm shadow-minimal font-medium'
              }`}
            >
              {/* Formatted Markdown-like text */}
              <div className="whitespace-pre-line space-y-2">
                {msg.text.split('\n\n').map((paragraph, i) => (
                  <p key={i}>
                    {paragraph.split('**').map((chunk, j) =>
                      j % 2 === 1 ? (
                        <strong key={j} className="text-surface-900 font-bold">
                          {chunk}
                        </strong>
                      ) : (
                        chunk
                      )
                    )}
                  </p>
                ))}
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-surface-400 pt-2 border-t border-surface-200/50">
                <span className="font-semibold">{msg.timestamp}</span>
                {msg.sender === 'bot' && (
                  <span className="text-[10px] text-surface-500 font-bold">
                    {msg.isFallback ? 'Verified Rule Engine' : 'Live AI'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-surface-50 text-surface-600 border border-surface-200 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4 animate-spin stroke-[1.5]" />
            </div>
            <div className="bg-white border border-surface-200 rounded-2xl rounded-tl-sm px-4 py-3 text-xs text-surface-500 flex items-center gap-2 shadow-minimal">
              <div className="w-1.5 h-1.5 rounded-full bg-surface-400 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-surface-400 animate-bounce delay-100" />
              <div className="w-1.5 h-1.5 rounded-full bg-surface-400 animate-bounce delay-200" />
              <span className="ml-1 font-semibold">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Quick Tap Pills */}
      <div className="px-5 py-3 bg-white border-t border-surface-200 space-y-2">
        <span className="text-[10px] uppercase font-bold text-surface-500 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Tap to Ask:</span>
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {suggestedQuestions.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sq)}
              disabled={loading}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-surface-50 hover:bg-surface-100 text-surface-700 hover:text-surface-900 border border-surface-200 whitespace-nowrap transition shrink-0 text-left disabled:opacity-50 shadow-sm"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <div className="p-4 bg-surface-50 border-t border-surface-200">
        <div className="flex items-center gap-2 bg-white border border-surface-300 rounded-xl px-3 py-1.5 focus-within:border-surface-900 transition shadow-minimal focus-within:shadow-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={`Ask about ${asset.symbol}...`}
            className="flex-1 bg-transparent text-sm text-surface-900 placeholder-surface-400 focus:outline-none py-2 font-medium"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2 rounded-lg bg-surface-900 hover:bg-surface-800 text-white font-bold disabled:opacity-40 transition shadow-minimal"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>
        <p className="text-[10px] text-surface-500 font-semibold text-center mt-2">
          Strictly scoped to financial literacy & {asset.name}.
        </p>
      </div>
    </div>
  );
}

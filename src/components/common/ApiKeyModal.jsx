import React, { useState } from 'react';
import { X, Sparkles, Database, UserCheck, Shield, RefreshCw, CheckCircle, ExternalLink, Copy } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ApiKeyModal({ isOpen, onClose }) {
  const { userId, supabaseStatus, resetAllData } = useApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetData = () => {
    resetAllData();
    setShowResetConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-white border border-surface-200 w-full max-w-lg rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between bg-surface-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-white border border-surface-200 text-surface-900 shadow-minimal">
              <Database className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-surface-900">Backend & System Status</h3>
              <p className="text-xs text-surface-500 font-medium">Supabase, server proxy, and session profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-900 hover:bg-white border border-transparent hover:border-surface-200 transition shadow-none hover:shadow-minimal"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        <div className="p-6 space-y-5 bg-white">
          {/* Supabase PostgreSQL Status */}
          <div className="p-5 rounded-xl bg-surface-50 border border-surface-200 space-y-3 shadow-inner">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-surface-500">Database Engine</span>
                <p className="text-sm font-bold text-surface-900 mt-1 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${supabaseStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                  {supabaseStatus === 'connected' ? 'Supabase PostgreSQL (Live Connected)' : 'Offline Local Fallback (100% Operational)'}
                </p>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${
                supabaseStatus === 'connected'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-yellow-50 text-yellow-700 border-yellow-200'
              }`}>
                {supabaseStatus === 'connected' ? 'PostgreSQL Active' : 'Fallback Active'}
              </span>
            </div>
            <p className="text-xs text-surface-600 leading-relaxed font-medium">
              Tables configured: <code className="text-surface-900 font-bold bg-white px-1 py-0.5 rounded border border-surface-200">assets</code>, <code className="text-surface-900 font-bold bg-white px-1 py-0.5 rounded border border-surface-200">quiz_questions</code>, <code className="text-surface-900 font-bold bg-white px-1 py-0.5 rounded border border-surface-200">user_profiles</code>, <code className="text-surface-900 font-bold bg-white px-1 py-0.5 rounded border border-surface-200">quiz_attempts</code>, and <code className="text-surface-900 font-bold bg-white px-1 py-0.5 rounded border border-surface-200">practice_investments</code>.
            </p>
          </div>

          {/* Anonymous User Profile Session */}
          <div className="p-5 rounded-xl bg-white border border-surface-200 space-y-3 shadow-minimal">
            <div className="flex items-center justify-between">
              <span className="font-bold text-surface-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 stroke-[1.5]" />
                <span>Anonymous Session ID</span>
              </span>
              <button
                onClick={handleCopyUserId}
                className="text-[11px] text-surface-600 hover:text-surface-900 flex items-center gap-1 font-bold bg-surface-50 px-2 py-1 rounded border border-surface-200 transition"
              >
                <Copy className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>{copied ? 'Copied!' : 'Copy UUID'}</span>
              </button>
            </div>
            <div className="p-3 bg-surface-50 rounded-lg font-mono text-xs text-surface-700 break-all border border-surface-200 font-semibold shadow-inner">
              {userId}
            </div>
            <p className="text-xs text-surface-500 font-medium">
              No password or credentials required. Each browser keeps a persistent anonymous session synced with <code className="text-surface-900 font-bold bg-surface-50 px-1 py-0.5 rounded border border-surface-200">user_profiles</code>.
            </p>
          </div>

          {/* Server-Side Proxy Security */}
          <div className="p-5 rounded-xl bg-white border border-surface-200 space-y-2 shadow-minimal">
            <div className="flex items-center gap-2 text-surface-900 font-bold">
              <Shield className="w-4 h-4 stroke-[1.5]" />
              <span>Server-Side API Security</span>
            </div>
            <p className="text-surface-600 leading-relaxed text-xs font-medium">
              All LLM tutor queries are routed through the backend <code className="text-surface-900 font-bold bg-surface-50 px-1 py-0.5 rounded border border-surface-200">/api/chat</code> endpoint. API keys remain strictly in server environment variables and are never bundled into client-side javascript.
            </p>
          </div>

          {/* Reset Demo Session */}
          <div className="pt-4 border-t border-surface-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-surface-900">Reset Session Data</p>
              <p className="text-xs text-surface-500 font-medium">Reset virtual balance and quiz attempts</p>
            </div>
            {showResetConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetData}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-minimal transition"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-2 bg-white border border-surface-200 text-surface-600 font-semibold hover:text-surface-900 hover:bg-surface-50 text-xs rounded-xl transition shadow-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-red-50 text-surface-700 hover:text-red-700 hover:border-red-200 text-xs font-bold border border-surface-200 transition shadow-minimal"
              >
                <RefreshCw className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Reset Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-surface-50 border-t border-surface-200 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-surface-900 hover:bg-surface-800 text-white text-sm font-bold rounded-xl shadow-minimal transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

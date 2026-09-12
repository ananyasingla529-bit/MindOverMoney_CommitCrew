import React from 'react';
import { BookOpen, Lightbulb, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function JargonExplainer({ asset }) {
  const jargonList = asset.plainEnglishJargon || [];

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-white">Plain-English Jargon Translator</h3>
          <p className="text-xs text-slate-400">Decoding Wall Street buzzwords into everyday concepts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 pt-1">
        {jargonList.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-surface-900/90 border border-slate-800 hover:border-slate-700 transition space-y-2.5"
          >
            {/* Term Name */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-brand-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                {item.term}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-surface-800 px-2 py-0.5 rounded">
                Key Metric
              </span>
            </div>

            {/* Plain English Translation */}
            <div className="text-xs text-slate-300 leading-relaxed pl-5 border-l-2 border-slate-700">
              <span className="font-semibold text-slate-200">What it means: </span>
              {item.definition}
            </div>

            {/* Why it Matters */}
            <div className="text-xs text-emerald-300/90 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-300">Why it matters to you: </span>
                <span>{item.whyItMatters}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

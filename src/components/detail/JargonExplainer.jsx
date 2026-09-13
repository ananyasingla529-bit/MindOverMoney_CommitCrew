import React from 'react';
import { BookOpen, Lightbulb, CheckCircle2 } from 'lucide-react';

export default function JargonExplainer({ asset }) {
  const jargonList = asset.plainEnglishJargon || [];

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
          <BookOpen className="w-5 h-5 stroke-[1.5]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-surface-900">Plain-English Jargon Translator</h3>
          <p className="text-xs text-surface-500 font-medium">Decoding Wall Street buzzwords into everyday concepts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 pt-1">
        {jargonList.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-surface-50 border border-surface-200 hover:border-surface-300 transition space-y-2.5"
          >
            {/* Term Name */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-surface-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 stroke-[1.5]" />
                {item.term}
              </span>
              <span className="text-[10px] uppercase font-bold text-surface-500 bg-white border border-surface-200 px-2 py-0.5 rounded">
                Key Metric
              </span>
            </div>

            {/* Plain English Translation */}
            <div className="text-xs text-surface-600 leading-relaxed pl-5 border-l-2 border-surface-300">
              <span className="font-semibold text-surface-900">What it means: </span>
              {item.definition}
            </div>

            {/* Why it Matters */}
            <div className="text-xs text-surface-600 bg-brand-50/60 p-2.5 rounded-lg border border-brand-100 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-brand-500 shrink-0 mt-0.5 stroke-[1.5]" />
              <div>
                <span className="font-bold text-brand-600">Why it matters to you: </span>
                <span>{item.whyItMatters}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

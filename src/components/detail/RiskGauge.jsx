import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Flame, Info, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { calculateRiskLevel } from '../../services/assetsService';

export default function RiskGauge({ asset }) {
  const [showFormula, setShowFormula] = useState(false);
  const risk = calculateRiskLevel(asset);
  const beta = asset.volatilityMetric?.beta ?? 1.0;
  const vol = asset.volatilityMetric?.annualizedVolatility ?? 15;
  const drawdown = asset.volatilityMetric?.maxDrawdown ?? -20;

  // Determine pointer percentage on meter (0% to 100%)
  let meterPosition = 20;
  if (risk.level === 'Medium') meterPosition = 50;
  if (risk.level === 'High') meterPosition = 85;

  return (
    <div className="bg-white rounded-2xl p-6 border border-surface-200 space-y-6 shadow-minimal font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-surface-500">
            Transparent Risk Analysis
          </span>
          <h3 className="text-xl font-bold text-surface-900 flex items-center gap-3 mt-1">
            <span>Visual Risk Indicator:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border bg-white shadow-sm ${risk.textColor} border-surface-200`}
            >
              {risk.level} Risk
            </span>
          </h3>
        </div>

        <button
          onClick={() => setShowFormula(!showFormula)}
          className="flex items-center gap-1.5 text-xs text-surface-600 hover:text-surface-900 font-semibold bg-surface-50 hover:bg-surface-100 px-3 py-2 rounded-xl border border-surface-200 transition shadow-sm"
        >
          <Info className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>{showFormula ? 'Hide Formula' : 'Why Not a Black Box?'}</span>
          {showFormula ? <ChevronUp className="w-3.5 h-3.5 stroke-[1.5]" /> : <ChevronDown className="w-3.5 h-3.5 stroke-[1.5]" />}
        </button>
      </div>

      {/* Visual Multi-segment Meter */}
      <div className="space-y-3">
        <div className="relative pt-3 pb-2">
          {/* Meter track */}
          <div className="h-4 w-full rounded-full flex overflow-hidden p-0.5 bg-surface-100 border border-surface-200 shadow-inner">
            <div className="w-1/3 h-full bg-green-500 rounded-l-full" />
            <div className="w-1/3 h-full bg-yellow-400 mx-0.5" />
            <div className="w-1/3 h-full bg-red-500 rounded-r-full" />
          </div>

          {/* Indicator Arrow */}
          <div
            className="absolute top-1 transition-all duration-700 -ml-3 flex flex-col items-center"
            style={{ left: `${meterPosition}%` }}
          >
            <div className="w-6 h-6 bg-white rounded-full shadow-md border-[3px] border-surface-900 flex items-center justify-center">
              <div
                className={`w-2 h-2 rounded-full ${
                  risk.level === 'Low' ? 'bg-green-500' : risk.level === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Meter Labels */}
        <div className="flex justify-between text-xs font-bold pt-1">
          <span className={`flex items-center gap-1.5 ${risk.level === 'Low' ? 'text-green-600 font-bold' : 'text-surface-500 font-medium'}`}>
            <ShieldCheck className="w-4 h-4 stroke-[1.5]" /> Low Risk
          </span>
          <span className={`flex items-center gap-1.5 ${risk.level === 'Medium' ? 'text-yellow-600 font-bold' : 'text-surface-500 font-medium'}`}>
            <AlertTriangle className="w-4 h-4 stroke-[1.5]" /> Medium Risk
          </span>
          <span className={`flex items-center gap-1.5 ${risk.level === 'High' ? 'text-red-600 font-bold' : 'text-surface-500 font-medium'}`}>
            <Flame className="w-4 h-4 stroke-[1.5]" /> High Risk
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4 pt-3">
        <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 text-center shadow-minimal">
          <span className="text-[10px] uppercase font-bold text-surface-500 block mb-1">Beta (Market Sensitivity)</span>
          <span className="text-xl font-bold text-surface-900 block">{beta}</span>
          <span className="text-[10px] text-surface-500 block mt-1 font-medium">
            {beta < 1 ? 'Calmer than S&P 500' : beta === 1 ? 'Equal to market' : 'Swings more than market'}
          </span>
        </div>

        <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 text-center shadow-minimal">
          <span className="text-[10px] uppercase font-bold text-surface-500 block mb-1">Annual Volatility</span>
          <span className="text-xl font-bold text-surface-900 block">{vol}%</span>
          <span className="text-[10px] text-surface-500 block mt-1 font-medium">
            {vol <= 15 ? 'Low price swings' : vol <= 35 ? 'Typical swings' : 'Extreme roller-coaster'}
          </span>
        </div>

        <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 text-center shadow-minimal">
          <span className="text-[10px] uppercase font-bold text-surface-500 block mb-1">Max Past Drawdown</span>
          <span className="text-xl font-bold text-red-600 block">{drawdown}%</span>
          <span className="text-[10px] text-surface-500 block mt-1 font-medium">Deepest historical drop</span>
        </div>
      </div>

      {/* Rule explanation quote */}
      <div className={`p-4 rounded-xl border text-sm leading-relaxed shadow-minimal font-medium ${
        risk.level === 'Low' ? 'bg-green-50 border-green-200 text-green-800' : 
        risk.level === 'Medium' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 
        'bg-red-50 border-red-200 text-red-800'
      }`}>
        <p>
          <strong className="font-bold">Classification Reason:</strong> {risk.reason}
        </p>
      </div>

      {/* Transparent Logic Breakdown Popdown */}
      {showFormula && (
        <div className="p-5 rounded-xl bg-surface-50 border border-surface-200 text-sm space-y-3 animate-fadeIn shadow-inner">
          <h4 className="font-bold text-surface-900 flex items-center gap-2">
            <Check className="w-4 h-4 stroke-[1.5]" />
            Our Explicit Risk Classification Rules (Zero Secrets)
          </h4>
          <p className="text-surface-600 leading-relaxed font-medium">
            Unlike commercial black-box robo-advisors, Mind Over Money calculates risk purely on math and asset type:
          </p>
          <ul className="space-y-2 text-surface-600 font-mono text-xs pl-2">
            <li>• <strong className="text-red-600 font-bold">High Risk:</strong> Category === 'Crypto' OR Beta &gt; 1.40 OR Volatility &gt; 35%</li>
            <li>• <strong className="text-yellow-600 font-bold">Medium Risk:</strong> Beta between 0.85 & 1.40 OR Volatility between 15% & 35%</li>
            <li>• <strong className="text-green-600 font-bold">Low Risk:</strong> Beta &lt; 0.85 AND Volatility &le; 15%</li>
          </ul>
        </div>
      )}
    </div>
  );
}

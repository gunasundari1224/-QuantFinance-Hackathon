import React from 'react';
import { PieChart, TrendingUp, TrendingDown, Zap, Shield } from 'lucide-react';
import { formatPercent } from '../utils/formatters';

export default function MarketRegimeSection({ regimeData, symbol }) {
  if (!regimeData || !regimeData.regime_breakdown_pct) {
    return (
      <div className="terminal-card p-6 text-center text-slate-400 font-mono text-xs my-4">
        Detecting market regimes...
      </div>
    );
  }

  const { total_bars, regime_breakdown_pct, regime_series } = regimeData;
  const currentRegime = regime_series && regime_series.length > 0 ? regime_series[regime_series.length - 1] : null;

  const regimeIcons = {
    'Bull Market': <TrendingUp className="w-4 h-4 text-emerald-400" />,
    'Bear Market': <TrendingDown className="w-4 h-4 text-amber-400" />,
    'High Volatility': <Zap className="w-4 h-4 text-rose-400" />,
    'Low Volatility': <Shield className="w-4 h-4 text-sky-400" />
  };

  return (
    <div className="terminal-card p-4 my-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center font-mono">
            <PieChart className="w-4 h-4 text-purple-400 mr-2" />
            Market Regime Segmentation ({symbol})
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Segmented across {total_bars} daily observations using 50-day trend slope and 20-day volatility quantiles.
          </p>
        </div>

        {currentRegime && (
          <div className="mt-2 md:mt-0 flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700">
            {regimeIcons[currentRegime.regime]}
            <div>
              <div className="text-[9px] uppercase font-bold text-slate-400 font-mono">Current Active Regime</div>
              <div className="text-xs font-bold text-white font-mono">{currentRegime.regime}</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        
        {/* Bull Market */}
        <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-1 font-mono">
            <span>Bull Market</span>
            <span>{formatPercent(regime_breakdown_pct['Bull Market'] || 0)}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded" 
              style={{ width: `${regime_breakdown_pct['Bull Market'] || 0}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Price &gt; 50d SMA with positive trend momentum.</p>
        </div>

        {/* Bear Market */}
        <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-1 font-mono">
            <span>Bear Market</span>
            <span>{formatPercent(regime_breakdown_pct['Bear Market'] || 0)}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded" 
              style={{ width: `${regime_breakdown_pct['Bear Market'] || 0}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Price &lt; 50d SMA with negative momentum.</p>
        </div>

        {/* High Volatility */}
        <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-rose-400 mb-1 font-mono">
            <span>High Volatility</span>
            <span>{formatPercent(regime_breakdown_pct['High Volatility'] || 0)}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
            <div 
              className="bg-rose-500 h-full rounded" 
              style={{ width: `${regime_breakdown_pct['High Volatility'] || 0}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Rolling vol in top 75th percentile range.</p>
        </div>

        {/* Low Volatility */}
        <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-sky-400 mb-1 font-mono">
            <span>Low Volatility</span>
            <span>{formatPercent(regime_breakdown_pct['Low Volatility'] || 0)}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
            <div 
              className="bg-sky-500 h-full rounded" 
              style={{ width: `${regime_breakdown_pct['Low Volatility'] || 0}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Rolling vol in bottom 25th percentile range.</p>
        </div>

      </div>
    </div>
  );
}

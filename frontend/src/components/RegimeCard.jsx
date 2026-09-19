import React from 'react';
import { ShieldCheck, TrendingUp, TrendingDown, Zap, Shield } from 'lucide-react';
import { formatPercent } from '../utils/formatters';

export default function RegimeCard({ regimeData, symbol }) {
  if (!regimeData || !regimeData.regime_breakdown_pct) {
    return (
      <div className="glass-card p-6 rounded-xl border border-gray-800 text-center text-gray-400">
        Analyzing market regimes...
      </div>
    );
  }

  const { total_bars, regime_breakdown_pct, regime_series } = regimeData;
  const currentRegime = regime_series && regime_series.length > 0 ? regime_series[regime_series.length - 1] : null;

  const regimeIcons = {
    'Bull Market': <TrendingUp className="w-5 h-5 text-emerald-400" />,
    'Bear Market': <TrendingDown className="w-5 h-5 text-amber-400" />,
    'High Volatility': <Zap className="w-5 h-5 text-rose-400" />,
    'Low Volatility': <Shield className="w-5 h-5 text-blue-400" />
  };

  return (
    <div className="glass-card p-5 rounded-xl border border-gray-800 my-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-4 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 mr-2"></span>
            Market Regime Classification for {symbol}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Classified over {total_bars} daily trading bars based on 50d trend slope and 20d rolling volatility quantiles.
          </p>
        </div>

        {currentRegime && (
          <div className="mt-3 md:mt-0 flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-700">
            {regimeIcons[currentRegime.regime]}
            <div>
              <div className="text-[10px] uppercase font-semibold text-gray-400">Latest Active Regime</div>
              <div className="text-xs font-bold text-white">{currentRegime.regime}</div>
            </div>
          </div>
        )}
      </div>

      {/* Breakdown Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Bull Market */}
        <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-1">
            <span>Bull Market</span>
            <span>{formatPercent(regime_breakdown_pct['Bull Market'] || 0)}</span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full" 
              style={{ width: `${regime_breakdown_pct['Bull Market'] || 0}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Price &gt; 50d SMA with positive trend momentum.</p>
        </div>

        {/* Bear Market */}
        <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400 mb-1">
            <span>Bear Market</span>
            <span>{formatPercent(regime_breakdown_pct['Bear Market'] || 0)}</span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full" 
              style={{ width: `${regime_breakdown_pct['Bear Market'] || 0}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Price &lt; 50d SMA with negative momentum.</p>
        </div>

        {/* High Volatility */}
        <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-400 mb-1">
            <span>High Volatility</span>
            <span>{formatPercent(regime_breakdown_pct['High Volatility'] || 0)}</span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-rose-500 h-full rounded-full" 
              style={{ width: `${regime_breakdown_pct['High Volatility'] || 0}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Rolling volatility in top 75th percentile.</p>
        </div>

        {/* Low Volatility */}
        <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-400 mb-1">
            <span>Low Volatility</span>
            <span>{formatPercent(regime_breakdown_pct['Low Volatility'] || 0)}</span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full" 
              style={{ width: `${regime_breakdown_pct['Low Volatility'] || 0}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Rolling volatility in bottom 25th percentile.</p>
        </div>

      </div>
    </div>
  );
}

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShieldAlert, Award, Percent } from 'lucide-react';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';

export default function MetricsHeader({ symbol, metrics, latestPrice }) {
  if (!metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 my-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-gray-900/60 rounded-xl border border-gray-800"></div>
        ))}
      </div>
    );
  }

  const { cumulative_return_pct, annualized_volatility, sharpe_ratio, max_drawdown_pct, cagr_pct } = metrics;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 my-4">
      
      {/* Current Price */}
      <div className="glass-card p-4 rounded-xl border border-gray-800 hover:border-cyan-500/40 transition-all">
        <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
          <span>{symbol} Price</span>
          <DollarSign className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-xl font-bold text-white mt-1">
          {formatCurrency(latestPrice)}
        </div>
        <div className={`text-xs mt-1 font-medium flex items-center ${cumulative_return_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {cumulative_return_pct >= 0 ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
          <span>{formatPercent(cumulative_return_pct)} (Cum. Return)</span>
        </div>
      </div>

      {/* Sharpe Ratio */}
      <div className="glass-card p-4 rounded-xl border border-gray-800 hover:border-emerald-500/40 transition-all">
        <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
          <span>Sharpe Ratio</span>
          <Award className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-xl font-bold text-white mt-1">
          {formatNumber(sharpe_ratio)}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {sharpe_ratio >= 1.5 ? 'Excellent Risk-Adjusted' : sharpe_ratio >= 1.0 ? 'Good' : 'Moderate'}
        </div>
      </div>

      {/* Volatility */}
      <div className="glass-card p-4 rounded-xl border border-gray-800 hover:border-yellow-500/40 transition-all">
        <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
          <span>Annual Volatility</span>
          <Percent className="w-4 h-4 text-yellow-400" />
        </div>
        <div className="text-xl font-bold text-white mt-1">
          {formatPercent(annualized_volatility * 100)}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Standard Deviation (252d)
        </div>
      </div>

      {/* Max Drawdown */}
      <div className="glass-card p-4 rounded-xl border border-gray-800 hover:border-rose-500/40 transition-all">
        <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
          <span>Max Drawdown</span>
          <ShieldAlert className="w-4 h-4 text-rose-400" />
        </div>
        <div className="text-xl font-bold text-rose-400 mt-1">
          -{formatPercent(max_drawdown_pct).replace('+', '')}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Peak-to-Trough Loss
        </div>
      </div>

      {/* CAGR */}
      <div className="glass-card p-4 rounded-xl border border-gray-800 hover:border-purple-500/40 transition-all">
        <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
          <span>CAGR</span>
          <TrendingUp className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-xl font-bold text-white mt-1">
          {formatPercent(cagr_pct)}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Annual Compounded Rate
        </div>
      </div>

    </div>
  );
}

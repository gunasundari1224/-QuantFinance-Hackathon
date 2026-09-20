import React from 'react';
import { ShieldAlert, Percent, Award, TrendingUp, Activity } from 'lucide-react';
import { formatPercent, formatNumber } from '../utils/formatters';

export default function RiskAnalyticsSection({ metrics, symbol }) {
  if (!metrics) {
    return (
      <div className="terminal-card p-6 text-center text-slate-400 font-mono text-xs my-4">
        Loading risk analytics...
      </div>
    );
  }

  const {
    cumulative_return_pct = 0,
    cagr_pct = 0,
    annualized_volatility = 0,
    volatility_pct = 0,
    sharpe_ratio = 0,
    max_drawdown_pct = 0
  } = metrics;

  return (
    <div className="terminal-card p-4 my-4">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <h3 className="text-sm font-bold text-white flex items-center font-mono">
          <Activity className="w-4 h-4 text-cyan-400 mr-2" />
          Quantitative Risk & Volatility Analytics ({symbol})
        </h3>
        <span className="text-[11px] text-slate-400 font-mono">Annualized 252-Day Baseline</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Volatility Card */}
        <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Annual Volatility</span>
            <Percent className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono-num mt-1">
            {formatPercent(volatility_pct || annualized_volatility * 100)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Standard Deviation of daily returns
          </div>
        </div>

        {/* Sharpe Ratio Card */}
        <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Sharpe Ratio</span>
            <Award className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono-num mt-1">
            {formatNumber(sharpe_ratio)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Excess return per unit of total risk
          </div>
        </div>

        {/* Max Drawdown Card */}
        <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Max Drawdown</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-lg font-bold text-rose-400 font-mono-num mt-1">
            -{formatPercent(max_drawdown_pct).replace('+', '')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Maximum peak-to-trough decline
          </div>
        </div>

        {/* CAGR Card */}
        <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>CAGR</span>
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono-num mt-1">
            {formatPercent(cagr_pct)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Compound Annual Growth Rate
          </div>
        </div>

      </div>
    </div>
  );
}

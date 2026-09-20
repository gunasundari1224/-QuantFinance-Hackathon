import React from 'react';
import { TrendingUp, TrendingDown, ShieldAlert, Award, PieChart, IndianRupee } from 'lucide-react';
import { formatINR, formatPercent, formatNumber } from '../utils/formatters';

export default function PortfolioKPIRow({ backtestSummary, initialCapital }) {
  if (!backtestSummary) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 my-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-20 terminal-card animate-pulse bg-slate-900/60"></div>
        ))}
      </div>
    );
  }

  const {
    final_capital = initialCapital,
    total_return_pct = 0,
    benchmark_return_pct = 0,
    sharpe_ratio = 0,
    max_drawdown_pct = 0
  } = backtestSummary;

  const netPnl = final_capital - initialCapital;
  const isProfitable = netPnl >= 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 my-4">
      
      {/* 1. Initial Capital */}
      <div className="terminal-card p-3.5 terminal-card-hover">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Initial Capital</span>
          <span className="text-[10px] font-mono font-semibold px-1 py-0.2 bg-slate-800 text-cyan-400 rounded">₹ INR</span>
        </div>
        <div className="text-lg font-bold text-white font-mono-num mt-1">
          {formatINR(initialCapital, 0)}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">Starting Baseline</div>
      </div>

      {/* 2. Current Portfolio Value */}
      <div className="terminal-card p-3.5 terminal-card-hover">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Portfolio Value</span>
          <span className="text-[10px] font-mono font-semibold px-1 py-0.2 bg-slate-800 text-cyan-400 rounded">₹ INR</span>
        </div>
        <div className="text-lg font-bold text-white font-mono-num mt-1">
          {formatINR(final_capital, 0)}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">Strategy Mark-to-Market</div>
      </div>

      {/* 3. Total P&L */}
      <div className="terminal-card p-3.5 terminal-card-hover">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Net Strategy P&L</span>
          <span className="text-[10px] font-mono font-semibold px-1 py-0.2 bg-slate-800 text-cyan-400 rounded">₹ INR</span>
        </div>
        <div className={`text-lg font-bold font-mono-num mt-1 ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
          {formatINR(netPnl, 0)}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">Absolute Rupee P&L</div>
      </div>

      {/* 4. Total Return % */}
      <div className="terminal-card p-3.5 terminal-card-hover">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Total Return</span>
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className={`text-lg font-bold font-mono-num mt-1 ${total_return_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {formatPercent(total_return_pct)}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          Bench: <span className="text-slate-300 font-mono-num">{formatPercent(benchmark_return_pct)}</span>
        </div>
      </div>

      {/* 5. Sharpe Ratio */}
      <div className="terminal-card p-3.5 terminal-card-hover">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Sharpe Ratio</span>
          <Award className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-lg font-bold text-white font-mono-num mt-1">
          {formatNumber(sharpe_ratio)}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          {sharpe_ratio >= 1.5 ? 'Strong Risk-Adj' : sharpe_ratio >= 1.0 ? 'Moderate' : 'Low Efficiency'}
        </div>
      </div>

      {/* 6. Maximum Drawdown */}
      <div className="terminal-card p-3.5 terminal-card-hover">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Max Drawdown</span>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="text-lg font-bold text-rose-400 font-mono-num mt-1">
          -{formatPercent(max_drawdown_pct).replace('+', '')}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">Peak-to-Trough Drop</div>
      </div>

    </div>
  );
}

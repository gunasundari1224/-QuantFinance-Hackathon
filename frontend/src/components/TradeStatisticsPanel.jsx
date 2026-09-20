import React from 'react';
import { Activity, Award, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';

export default function TradeStatisticsPanel({ backtestSummary, trades }) {
  if (!backtestSummary || !trades) return null;

  const {
    total_trades = 0,
    win_rate_pct = 0,
    profit_factor = 0
  } = backtestSummary;

  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl < 0);

  const bestTradePnl = trades.length > 0 ? Math.max(...trades.map(t => t.pnl)) : 0;
  const worstTradePnl = trades.length > 0 ? Math.min(...trades.map(t => t.pnl)) : 0;

  const avgPnl = trades.length > 0 ? trades.reduce((acc, t) => acc + t.pnl, 0) / trades.length : 0;

  return (
    <div className="terminal-card p-4 my-4">
      <h3 className="text-sm font-bold text-white mb-3 flex items-center font-mono">
        <Activity className="w-4 h-4 text-cyan-400 mr-2" />
        Trade Execution & Statistical Breakdown
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono-num text-xs">
        
        <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400">Total Trades</div>
          <div className="text-base font-bold text-white mt-0.5">{total_trades}</div>
        </div>

        <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400">Winning Trades</div>
          <div className="text-base font-bold text-emerald-400 mt-0.5">{winningTrades.length}</div>
        </div>

        <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400">Losing Trades</div>
          <div className="text-base font-bold text-rose-400 mt-0.5">{losingTrades.length}</div>
        </div>

        <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400">Win Rate</div>
          <div className="text-base font-bold text-cyan-400 mt-0.5">{formatPercent(win_rate_pct)}</div>
        </div>

        <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400">Profit Factor</div>
          <div className="text-base font-bold text-amber-400 mt-0.5">{formatNumber(profit_factor)}</div>
        </div>

        <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400">Average Trade P&L</div>
          <div className={`text-base font-bold mt-0.5 ${avgPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(avgPnl, 0)}
          </div>
        </div>

        <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400">Best Trade</div>
          <div className="text-base font-bold text-emerald-400 mt-0.5">{formatCurrency(bestTradePnl, 0)}</div>
        </div>

        <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400">Worst Trade</div>
          <div className="text-base font-bold text-rose-400 mt-0.5">{formatCurrency(worstTradePnl, 0)}</div>
        </div>

      </div>
    </div>
  );
}

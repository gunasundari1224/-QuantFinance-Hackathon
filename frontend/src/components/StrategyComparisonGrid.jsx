import React from 'react';
import { Award, ShieldAlert, Activity, TrendingUp, Layers } from 'lucide-react';
import { formatPercent, formatNumber } from '../utils/formatters';

export default function StrategyComparisonGrid({ comparisonResults, selectedStrategy, setSelectedStrategy, isLoading }) {
  const strategyCatalog = [
    { id: 'SMA_CROSSOVER', name: 'SMA Crossover', desc: 'Fast/Slow Moving Average Convergence' },
    { id: 'EMA_TREND', name: 'EMA Trend Strategy', desc: 'Exponential MA Slope Continuation' },
    { id: 'MOMENTUM', name: 'Momentum Strategy', desc: 'N-Day Rate-of-Change Breakout' },
    { id: 'MEAN_REVERSION', name: 'Mean Reversion', desc: 'Price Z-Score Deviation Bands' },
    { id: 'BUY_HOLD', name: 'Buy & Hold', desc: 'Passive Baseline Benchmark' }
  ];

  return (
    <div className="terminal-card p-4 my-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center font-mono">
            <Layers className="w-4 h-4 text-cyan-400 mr-2" />
            Algorithmic Strategy Comparison Matrix
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Side-by-side performance evaluation on active asset calculated with realistic friction.
          </p>
        </div>

        {isLoading && (
          <span className="text-xs text-cyan-400 font-mono animate-pulse flex items-center">
            <Activity className="w-3.5 h-3.5 mr-1" /> Evaluating Matrix...
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {strategyCatalog.map(strat => {
          const res = comparisonResults[strat.id] || {};
          const isSelected = selectedStrategy === strat.id;
          const retPct = res.total_return_pct ?? (strat.id === 'BUY_HOLD' ? comparisonResults['SMA_CROSSOVER']?.benchmark_return_pct ?? 0 : 0);
          const sharpe = res.sharpe_ratio ?? (strat.id === 'BUY_HOLD' ? comparisonResults['SMA_CROSSOVER']?.benchmark_sharpe_ratio ?? 0 : 0);
          const maxDd = res.max_drawdown_pct ?? (strat.id === 'BUY_HOLD' ? comparisonResults['SMA_CROSSOVER']?.benchmark_max_drawdown_pct ?? 0 : 0);
          const totalTrades = res.total_trades ?? (strat.id === 'BUY_HOLD' ? 1 : 0);
          const winRate = res.win_rate_pct ?? (strat.id === 'BUY_HOLD' ? 100 : 0);

          const isPositive = retPct >= 0;

          return (
            <div
              key={strat.id}
              onClick={() => strat.id !== 'BUY_HOLD' && setSelectedStrategy(strat.id)}
              className={`p-3.5 rounded-lg border transition-all ${
                strat.id === 'BUY_HOLD'
                  ? 'border-slate-800 bg-slate-900/30'
                  : isSelected
                  ? 'border-cyan-500 bg-slate-900/90 shadow-md shadow-cyan-500/10 cursor-pointer'
                  : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700 cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">{strat.name}</span>
                {isSelected && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{strat.desc}</p>

              <div className="mt-3 pt-2 border-t border-slate-800 space-y-1.5 text-xs font-mono-num">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Total Return:</span>
                  <span className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatPercent(retPct)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Sharpe Ratio:</span>
                  <span className="text-slate-200 font-semibold">{formatNumber(sharpe)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Max Drawdown:</span>
                  <span className="text-rose-400 font-semibold">-{formatPercent(maxDd).replace('+', '')}</span>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Trades / Win Rate:</span>
                  <span className="text-slate-300">{totalTrades} ({winRate}%)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

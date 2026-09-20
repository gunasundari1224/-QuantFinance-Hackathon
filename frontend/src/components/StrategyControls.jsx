import React from 'react';
import { Play, Settings, Percent, Calendar } from 'lucide-react';
import { DEFAULT_USD_TO_INR, formatINR } from '../utils/formatters';

export default function StrategyControls({
  selectedAsset,
  setSelectedAsset,
  selectedStrategy,
  setSelectedStrategy,
  strategyParams,
  setStrategyParams,
  initialCapital,
  setInitialCapital,
  transactionCostPct,
  setTransactionCostPct,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onRunBacktest,
  isLoading
}) {
  const assets = [
    { symbol: 'BTC-USD', name: 'Bitcoin (BTC)' },
    { symbol: 'NVDA', name: 'NVIDIA (NVDA)' },
    { symbol: 'GC=F', name: 'Gold (XAU)' },
    { symbol: 'SPY', name: 'S&P 500 ETF (SPY)' }
  ];

  const strategies = [
    { id: 'SMA_CROSSOVER', name: 'SMA Crossover Strategy' },
    { id: 'EMA_TREND', name: 'EMA Trend Strategy' },
    { id: 'MOMENTUM', name: 'Momentum Strategy' },
    { id: 'MEAN_REVERSION', name: 'Mean Reversion Strategy' }
  ];

  const handleParamChange = (key, val) => {
    setStrategyParams(prev => ({ ...prev, [key]: Number(val) }));
  };

  return (
    <div className="terminal-card p-4 my-4">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800">
        <h3 className="text-sm font-bold text-white flex items-center font-mono">
          <Settings className="w-4 h-4 text-cyan-400 mr-2" />
          Quant Terminal Strategy & Execution Parameters
        </h3>
        <button
          onClick={onRunBacktest}
          disabled={isLoading}
          className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-xs rounded-md shadow-md shadow-sky-500/20 transition-all disabled:opacity-50 font-mono"
        >
          <Play className="w-3.5 h-3.5 fill-slate-950" />
          <span>{isLoading ? 'Simulating...' : 'Execute Backtest'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        
        {/* Target Asset */}
        <div>
          <label className="block text-slate-400 mb-1 font-mono">Target Asset</label>
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="w-full terminal-input rounded-md p-2 font-mono"
          >
            {assets.map(a => (
              <option key={a.symbol} value={a.symbol}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Strategy Selector */}
        <div>
          <label className="block text-slate-400 mb-1 font-mono">Strategy Logic</label>
          <select
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value)}
            className="w-full terminal-input rounded-md p-2 font-mono text-cyan-400 font-semibold"
          >
            {strategies.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Initial Capital (INR Conversion Label) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-400 font-mono">Initial Capital ($ Base)</label>
            <span className="text-[10px] text-cyan-400 font-mono font-semibold">{formatINR(initialCapital, 0)}</span>
          </div>
          <input
            type="number"
            value={initialCapital}
            onChange={(e) => setInitialCapital(Number(e.target.value))}
            className="w-full terminal-input rounded-md p-2 font-mono-num"
          />
        </div>

        {/* Transaction Fee % */}
        <div>
          <label className="block text-slate-400 mb-1 font-mono">Transaction Fee (%)</label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={transactionCostPct * 100}
              onChange={(e) => setTransactionCostPct(Number(e.target.value) / 100)}
              className="w-full terminal-input rounded-md p-2 pl-6 font-mono-num"
            />
            <Percent className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
          </div>
        </div>

      </div>

      {/* Strategy Parameters & Date Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-800 text-xs">
        
        {/* Fast Period (for SMA / EMA) */}
        {(selectedStrategy === 'SMA_CROSSOVER' || selectedStrategy === 'EMA_TREND') && (
          <div>
            <label className="block text-slate-400 mb-1 font-mono">Fast Moving Average (Days)</label>
            <input
              type="number"
              value={strategyParams.fast_period || 10}
              onChange={(e) => handleParamChange('fast_period', e.target.value)}
              className="w-full terminal-input rounded-md p-2 font-mono-num"
            />
          </div>
        )}

        {/* Slow Period (for SMA / EMA) */}
        {(selectedStrategy === 'SMA_CROSSOVER' || selectedStrategy === 'EMA_TREND') && (
          <div>
            <label className="block text-slate-400 mb-1 font-mono">Slow Moving Average (Days)</label>
            <input
              type="number"
              value={strategyParams.slow_period || 50}
              onChange={(e) => handleParamChange('slow_period', e.target.value)}
              className="w-full terminal-input rounded-md p-2 font-mono-num"
            />
          </div>
        )}

        {/* Momentum Controls */}
        {selectedStrategy === 'MOMENTUM' && (
          <>
            <div>
              <label className="block text-slate-400 mb-1 font-mono">Momentum Lookback (Days)</label>
              <input
                type="number"
                value={strategyParams.momentum_period || 20}
                onChange={(e) => handleParamChange('momentum_period', e.target.value)}
                className="w-full terminal-input rounded-md p-2 font-mono-num"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono">Momentum Threshold (%)</label>
              <input
                type="number"
                step="0.5"
                value={(strategyParams.threshold_pct ?? 0.02) * 100}
                onChange={(e) => handleParamChange('threshold_pct', Number(e.target.value) / 100)}
                className="w-full terminal-input rounded-md p-2 font-mono-num"
              />
            </div>
          </>
        )}

        {/* Mean Reversion Controls */}
        {selectedStrategy === 'MEAN_REVERSION' && (
          <>
            <div>
              <label className="block text-slate-400 mb-1 font-mono">Lookback Window (Days)</label>
              <input
                type="number"
                value={strategyParams.lookback_period || 20}
                onChange={(e) => handleParamChange('lookback_period', e.target.value)}
                className="w-full terminal-input rounded-md p-2 font-mono-num"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono">Z-Score Entry Threshold</label>
              <input
                type="number"
                step="0.1"
                value={strategyParams.z_threshold || 1.5}
                onChange={(e) => handleParamChange('z_threshold', e.target.value)}
                className="w-full terminal-input rounded-md p-2 font-mono-num"
              />
            </div>
          </>
        )}

        {/* Start Date */}
        <div>
          <label className="block text-slate-400 mb-1 font-mono">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full terminal-input rounded-md p-2 font-mono"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-slate-400 mb-1 font-mono">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full terminal-input rounded-md p-2 font-mono"
          />
        </div>

      </div>
    </div>
  );
}

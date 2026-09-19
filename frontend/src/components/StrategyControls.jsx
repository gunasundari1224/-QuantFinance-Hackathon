import React from 'react';
import { Play, Settings, DollarSign, Percent, Calendar } from 'lucide-react';

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
    { id: 'SMA_CROSSOVER', name: 'SMA Crossover' },
    { id: 'EMA_TREND', name: 'EMA Trend Strategy' },
    { id: 'MOMENTUM', name: 'Momentum Strategy' },
    { id: 'MEAN_REVERSION', name: 'Mean Reversion Strategy' }
  ];

  const handleParamChange = (key, val) => {
    setStrategyParams(prev => ({ ...prev, [key]: Number(val) }));
  };

  return (
    <div className="glass-card p-5 rounded-xl border border-gray-800 my-4">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white flex items-center">
          <Settings className="w-4 h-4 text-cyan-400 mr-2" />
          Strategy & Backtest Parameters
        </h3>
        <button
          onClick={onRunBacktest}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-black" />
          <span>{isLoading ? 'Simulating...' : 'Run Backtest'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        
        {/* Asset Selector */}
        <div>
          <label className="block text-gray-400 mb-1 font-medium">Target Asset</label>
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 focus:border-cyan-500 focus:outline-none"
          >
            {assets.map(a => (
              <option key={a.symbol} value={a.symbol}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Strategy Selector */}
        <div>
          <label className="block text-gray-400 mb-1 font-medium">Algorithmic Strategy</label>
          <select
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 focus:border-cyan-500 focus:outline-none font-medium text-cyan-400"
          >
            {strategies.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Initial Capital */}
        <div>
          <label className="block text-gray-400 mb-1 font-medium">Initial Capital ($)</label>
          <div className="relative">
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 pl-7 focus:border-cyan-500 focus:outline-none"
            />
            <DollarSign className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
          </div>
        </div>

        {/* Transaction Fee % */}
        <div>
          <label className="block text-gray-400 mb-1 font-medium">Transaction Fee (%)</label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={transactionCostPct * 100}
              onChange={(e) => setTransactionCostPct(Number(e.target.value) / 100)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 pl-7 focus:border-cyan-500 focus:outline-none"
            />
            <Percent className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
          </div>
        </div>

      </div>

      {/* Dynamic Strategy Specific Parameters & Date Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-800 text-xs">
        
        {/* Fast Period (for SMA / EMA) */}
        {(selectedStrategy === 'SMA_CROSSOVER' || selectedStrategy === 'EMA_TREND') && (
          <div>
            <label className="block text-gray-400 mb-1 font-medium">Fast Moving Average (Days)</label>
            <input
              type="number"
              value={strategyParams.fast_period || 10}
              onChange={(e) => handleParamChange('fast_period', e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        )}

        {/* Slow Period (for SMA / EMA) */}
        {(selectedStrategy === 'SMA_CROSSOVER' || selectedStrategy === 'EMA_TREND') && (
          <div>
            <label className="block text-gray-400 mb-1 font-medium">Slow Moving Average (Days)</label>
            <input
              type="number"
              value={strategyParams.slow_period || 50}
              onChange={(e) => handleParamChange('slow_period', e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        )}

        {/* Momentum Lookback */}
        {selectedStrategy === 'MOMENTUM' && (
          <>
            <div>
              <label className="block text-gray-400 mb-1 font-medium">Momentum Lookback (Days)</label>
              <input
                type="number"
                value={strategyParams.momentum_period || 20}
                onChange={(e) => handleParamChange('momentum_period', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1 font-medium">Momentum Threshold (%)</label>
              <input
                type="number"
                step="0.5"
                value={(strategyParams.threshold_pct ?? 0.02) * 100}
                onChange={(e) => handleParamChange('threshold_pct', Number(e.target.value) / 100)}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </>
        )}

        {/* Mean Reversion Controls */}
        {selectedStrategy === 'MEAN_REVERSION' && (
          <>
            <div>
              <label className="block text-gray-400 mb-1 font-medium">Lookback Window (Days)</label>
              <input
                type="number"
                value={strategyParams.lookback_period || 20}
                onChange={(e) => handleParamChange('lookback_period', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1 font-medium">Z-Score Entry Threshold</label>
              <input
                type="number"
                step="0.1"
                value={strategyParams.z_threshold || 1.5}
                onChange={(e) => handleParamChange('z_threshold', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </>
        )}

        {/* Start Date */}
        <div>
          <label className="block text-gray-400 mb-1 font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-gray-400 mb-1 font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:border-cyan-500 focus:outline-none"
          />
        </div>

      </div>
    </div>
  );
}

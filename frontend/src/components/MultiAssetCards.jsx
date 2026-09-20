import React from 'react';
import { TrendingUp, TrendingDown, Layers } from 'lucide-react';
import { formatINR, formatPercent } from '../utils/formatters';

export default function MultiAssetCards({ multiAssetData, selectedAsset, setSelectedAsset, selectedStrategy }) {
  const assetCatalog = [
    { symbol: 'BTC-USD', name: 'Bitcoin', type: 'Crypto Asset' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'US Tech Equity' },
    { symbol: 'GC=F', name: 'Gold Futures', type: 'Commodity' },
    { symbol: 'SPY', name: 'S&P 500 ETF', type: 'Benchmark Index' }
  ];

  return (
    <div className="my-4">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center font-mono">
          <Layers className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
          Multi-Asset Intelligence Summary (INR Prices)
        </h3>
        <span className="text-[11px] text-slate-400 font-mono">Click card to select asset • Prices converted to ₹ INR</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {assetCatalog.map(asset => {
          const data = multiAssetData[asset.symbol] || {};
          const priceUSD = data.latestPrice || 0;
          const returnPct = data.cumulative_return_pct || 0;
          const volPct = data.volatility_pct || 0;
          const isSelected = selectedAsset === asset.symbol;
          const isPositive = returnPct >= 0;

          return (
            <div
              key={asset.symbol}
              onClick={() => setSelectedAsset(asset.symbol)}
              className={`terminal-card p-3.5 cursor-pointer transition-all border ${
                isSelected
                  ? 'border-cyan-500/80 bg-slate-900/90 shadow-lg shadow-cyan-500/10'
                  : 'border-slate-800/80 hover:border-slate-700 bg-slate-900/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white font-mono">{asset.symbol}</span>
                    {isSelected && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">{asset.name}</div>
                </div>

                <div className={`p-1.5 rounded-md ${isPositive ? 'bg-emerald-950/60 text-emerald-400' : 'bg-rose-950/60 text-rose-400'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-base font-bold text-white font-mono-num">{formatINR(priceUSD, 0)}</span>
                <span className={`text-xs font-semibold font-mono-num ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatPercent(returnPct)}
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Vol: <strong className="text-slate-300">{formatPercent(volPct)}</strong></span>
                <span>Strat: <strong className="text-cyan-400">{selectedStrategy.replace('_', ' ')}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

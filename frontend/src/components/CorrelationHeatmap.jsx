import React from 'react';
import { formatNumber } from '../utils/formatters';

export default function CorrelationHeatmap({ matrixData, rollingData }) {
  if (!matrixData || !matrixData.symbols || matrixData.symbols.length === 0) {
    return (
      <div className="glass-card p-6 rounded-xl border border-gray-800 text-center text-gray-400">
        Loading correlation matrix...
      </div>
    );
  }

  const { symbols, matrix } = matrixData;

  const getHeatmapColor = (val) => {
    if (val === 1.0) return 'bg-cyan-950 text-cyan-300 border-cyan-800';
    if (val >= 0.7) return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
    if (val >= 0.3) return 'bg-emerald-950/40 text-emerald-400 border-emerald-900';
    if (val >= -0.3) return 'bg-gray-900 text-gray-300 border-gray-800';
    if (val >= -0.7) return 'bg-rose-950/40 text-rose-400 border-rose-900';
    return 'bg-rose-950/80 text-rose-300 border-rose-800';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-4">
      
      {/* N x N Pearson Matrix */}
      <div className="glass-card p-5 rounded-xl border border-gray-800">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mr-2"></span>
          Cross-Asset Pearson Correlation Heatmap
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-xs font-semibold text-gray-400 border-b border-gray-800 text-left">Asset</th>
                {symbols.map(s => (
                  <th key={s} className="p-3 text-xs font-semibold text-cyan-400 border-b border-gray-800">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {symbols.map((rowSym, rowIndex) => (
                <tr key={rowSym}>
                  <td className="p-3 text-xs font-semibold text-cyan-400 border-r border-gray-800 text-left bg-gray-900/40">{rowSym}</td>
                  {matrix[rowIndex].map((val, colIndex) => (
                    <td key={colIndex} className="p-2 border border-gray-800/80">
                      <div className={`py-2 rounded-lg text-xs font-mono font-semibold border ${getHeatmapColor(val)}`}>
                        {formatNumber(val, 2)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-800/80">
          <span className="flex items-center"><span className="w-3 h-3 bg-emerald-950 border border-emerald-800 rounded mr-1.5 inline-block"></span> High Positive (&gt; 0.7)</span>
          <span className="flex items-center"><span className="w-3 h-3 bg-gray-900 border border-gray-800 rounded mr-1.5 inline-block"></span> Neutral (-0.3 to 0.3)</span>
          <span className="flex items-center"><span className="w-3 h-3 bg-rose-950 border border-rose-800 rounded mr-1.5 inline-block"></span> Inverse (&lt; -0.3)</span>
        </div>
      </div>

      {/* Rolling Correlation Summary & Insights */}
      <div className="glass-card p-5 rounded-xl border border-gray-800 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2"></span>
            Cross-Asset Diversification Insights
          </h3>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            Low or negative correlation between asset classes allows portfolio managers to reduce overall portfolio drawdown without sacrificing long-term compound growth.
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-gray-900/60 rounded-lg border border-gray-800">
              <div className="text-xs font-semibold text-yellow-400">Gold (GC=F) Safe-Haven Role</div>
              <div className="text-xs text-gray-300 mt-0.5">
                Exhibits low correlation to Bitcoin and equities, providing systemic downside hedging during market shocks.
              </div>
            </div>

            <div className="p-3 bg-gray-900/60 rounded-lg border border-gray-800">
              <div className="text-xs font-semibold text-cyan-400">Bitcoin (BTC) & NVIDIA (NVDA) Beta</div>
              <div className="text-xs text-gray-300 mt-0.5">
                High-growth risk-on assets with variable rolling correlation depending on macroeconomic liquidity regimes.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-800 text-xs text-gray-400">
          30-Day Rolling Window Analysis aligned across daily calendars.
        </div>
      </div>

    </div>
  );
}

import React from 'react';
import { Grid, Shield } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export default function CorrelationHeatmapSection({ correlationData }) {
  if (!correlationData || !correlationData.matrix || !correlationData.matrix.symbols) {
    return (
      <div className="terminal-card p-6 text-center text-slate-400 font-mono text-xs my-4">
        Loading correlation matrix...
      </div>
    );
  }

  const { symbols, matrix } = correlationData.matrix;

  const getHeatmapColor = (val) => {
    if (val === 1.0) return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
    if (val >= 0.7) return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
    if (val >= 0.3) return 'bg-emerald-950/40 text-emerald-400 border-emerald-900';
    if (val >= -0.3) return 'bg-slate-900 text-slate-300 border-slate-800';
    if (val >= -0.7) return 'bg-rose-950/40 text-rose-400 border-rose-900';
    return 'bg-rose-950/80 text-rose-300 border-rose-800';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-4">
      
      {/* Pearson Heatmap Matrix (2 Cols) */}
      <div className="lg:col-span-2 terminal-card p-4">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center font-mono">
          <Grid className="w-4 h-4 text-cyan-400 mr-2" />
          Cross-Asset Pearson Correlation Heatmap Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="p-2.5 text-xs font-semibold text-slate-400 border-b border-slate-800 text-left font-mono">Asset</th>
                {symbols.map(s => (
                  <th key={s} className="p-2.5 text-xs font-bold text-cyan-400 border-b border-slate-800 font-mono">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {symbols.map((rowSym, rowIndex) => (
                <tr key={rowSym}>
                  <td className="p-2.5 text-xs font-bold text-cyan-400 border-r border-slate-800 text-left bg-slate-900/60 font-mono">{rowSym}</td>
                  {matrix[rowIndex].map((val, colIndex) => (
                    <td key={colIndex} className="p-1.5 border border-slate-800/80">
                      <div className={`py-2 rounded text-xs font-mono font-bold border ${getHeatmapColor(val)}`}>
                        {formatNumber(val, 2)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
          <span className="flex items-center"><span className="w-2.5 h-2.5 bg-emerald-950 border border-emerald-800 rounded mr-1.5 inline-block"></span> Positive (&gt; 0.3)</span>
          <span className="flex items-center"><span className="w-2.5 h-2.5 bg-slate-900 border border-slate-800 rounded mr-1.5 inline-block"></span> Neutral (-0.3 to 0.3)</span>
          <span className="flex items-center"><span className="w-2.5 h-2.5 bg-rose-950 border border-rose-800 rounded mr-1.5 inline-block"></span> Inverse (&lt; -0.3)</span>
        </div>
      </div>

      {/* Cross-Asset Hedging Insights (1 Col) */}
      <div className="terminal-card p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-white mb-3 flex items-center font-mono">
            <Shield className="w-4 h-4 text-emerald-400 mr-2" />
            Cross-Asset Risk Hedging
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Pairing assets with low or negative correlation minimizes portfolio-wide drawdown during systemic equity drawdowns.
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
              <span className="font-bold text-amber-400 block font-mono">Gold (GC=F) Safe-Haven</span>
              <span className="text-slate-300 text-[11px] mt-0.5 block">
                Demonstrates low correlation with Bitcoin & Tech Equities, offering tail-risk protection.
              </span>
            </div>

            <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800">
              <span className="font-bold text-cyan-400 block font-mono">BTC & NVDA Growth Beta</span>
              <span className="text-slate-300 text-[11px] mt-0.5 block">
                High-growth risk-on assets driven by global liquidity expansion cycles.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
          30-Day Rolling Window Dataset
        </div>
      </div>

    </div>
  );
}

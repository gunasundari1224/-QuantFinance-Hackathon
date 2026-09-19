import React from 'react';
import { formatCurrency, formatPercent } from '../utils/formatters';

export default function TradeLogTable({ trades }) {
  if (!trades || trades.length === 0) {
    return (
      <div className="glass-card p-6 rounded-xl border border-gray-800 text-center text-gray-400 my-4 text-xs">
        No executed trades for the selected strategy and parameter combination.
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4 border border-gray-800 my-4">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 mr-2"></span>
        Executed Trade Log & Friction Details ({trades.length} trades)
      </h3>

      <div className="overflow-x-auto max-h-80 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-[#0f172a] text-gray-400 border-b border-gray-800">
            <tr>
              <th className="p-2.5 font-semibold">#</th>
              <th className="p-2.5 font-semibold">Entry Date</th>
              <th className="p-2.5 font-semibold">Exit Date</th>
              <th className="p-2.5 font-semibold">Type</th>
              <th className="p-2.5 font-semibold text-right">Entry Price</th>
              <th className="p-2.5 font-semibold text-right">Exit Price</th>
              <th className="p-2.5 font-semibold text-right">Trade Fee</th>
              <th className="p-2.5 font-semibold text-right">PnL ($)</th>
              <th className="p-2.5 font-semibold text-right">PnL (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 font-mono">
            {trades.map((t) => (
              <tr key={t.trade_id} className="hover:bg-gray-800/40 transition-colors">
                <td className="p-2.5 text-gray-400">{t.trade_id}</td>
                <td className="p-2.5 text-gray-200">{t.entry_date}</td>
                <td className="p-2.5 text-gray-200">{t.exit_date || 'OPEN'}</td>
                <td className="p-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    BUY
                  </span>
                </td>
                <td className="p-2.5 text-right text-gray-300">{formatCurrency(t.entry_price)}</td>
                <td className="p-2.5 text-right text-gray-300">{t.exit_price ? formatCurrency(t.exit_price) : '-'}</td>
                <td className="p-2.5 text-right text-yellow-500">{formatCurrency(t.fee)}</td>
                <td className={`p-2.5 text-right font-semibold ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(t.pnl)}
                </td>
                <td className={`p-2.5 text-right font-semibold ${t.pnl_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatPercent(t.pnl_pct)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

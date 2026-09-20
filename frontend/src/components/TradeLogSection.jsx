import React, { useState } from 'react';
import { Terminal } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';

export default function TradeLogSection({ trades }) {
  const [sortField, setSortField] = useState('trade_id');
  const [sortAsc, setSortAsc] = useState(true);

  if (!trades || trades.length === 0) {
    return (
      <div className="terminal-card p-6 text-center text-slate-400 font-mono text-xs my-4">
        No executed trades recorded for this strategy configuration.
      </div>
    );
  }

  const sortedTrades = [...trades].sort((a, b) => {
    let valA = a[sortField] ?? 0;
    let valB = b[sortField] ?? 0;
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="terminal-card p-4 my-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white flex items-center font-mono">
          <Terminal className="w-4 h-4 text-amber-400 mr-2" />
          Executed Trade Log Ledger ({trades.length} trades)
        </h3>
        <span className="text-[11px] text-slate-400 font-mono">Shift(1) Execution • Friction Applied</span>
      </div>

      <div className="overflow-x-auto max-h-80 overflow-y-auto border border-slate-800 rounded">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-900 text-slate-400 border-b border-slate-800 font-mono">
            <tr>
              <th onClick={() => handleSort('trade_id')} className="p-2.5 font-semibold cursor-pointer hover:text-white">#</th>
              <th onClick={() => handleSort('entry_date')} className="p-2.5 font-semibold cursor-pointer hover:text-white">Entry Date</th>
              <th onClick={() => handleSort('exit_date')} className="p-2.5 font-semibold cursor-pointer hover:text-white">Exit Date</th>
              <th className="p-2.5 font-semibold">Position</th>
              <th onClick={() => handleSort('entry_price')} className="p-2.5 font-semibold text-right cursor-pointer hover:text-white">Entry Price</th>
              <th onClick={() => handleSort('exit_price')} className="p-2.5 font-semibold text-right cursor-pointer hover:text-white">Exit Price</th>
              <th onClick={() => handleSort('fee')} className="p-2.5 font-semibold text-right cursor-pointer hover:text-white">Trade Fee</th>
              <th onClick={() => handleSort('pnl')} className="p-2.5 font-semibold text-right cursor-pointer hover:text-white">PnL ($)</th>
              <th onClick={() => handleSort('pnl_pct')} className="p-2.5 font-semibold text-right cursor-pointer hover:text-white">Return (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono-num text-xs">
            {sortedTrades.map((t) => (
              <tr key={t.trade_id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-2.5 text-slate-400">{t.trade_id}</td>
                <td className="p-2.5 text-slate-200">{t.entry_date}</td>
                <td className="p-2.5 text-slate-200">{t.exit_date || 'OPEN'}</td>
                <td className="p-2.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                    LONG (BUY)
                  </span>
                </td>
                <td className="p-2.5 text-right text-slate-300">{formatCurrency(t.entry_price)}</td>
                <td className="p-2.5 text-right text-slate-300">{t.exit_price ? formatCurrency(t.exit_price) : '-'}</td>
                <td className="p-2.5 text-right text-amber-400">{formatCurrency(t.fee)}</td>
                <td className={`p-2.5 text-right font-bold ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(t.pnl)}
                </td>
                <td className={`p-2.5 text-right font-bold ${t.pnl_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
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

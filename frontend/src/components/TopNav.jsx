import React from 'react';
import { Activity, ShieldCheck, Clock, Terminal, Bot, IndianRupee } from 'lucide-react';
import { DEFAULT_USD_TO_INR } from '../utils/formatters';

export default function TopNav({ activeSection, setActiveSection }) {
  const currentTimeStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  const navItems = [
    { id: 'overview', label: 'Terminal Overview' },
    { id: 'analysis', label: 'Market Analysis' },
    { id: 'backtest', label: 'Backtest Engine' },
    { id: 'comparison', label: 'Strategy Matrix' },
    { id: 'risk', label: 'Risk & Regimes' },
    { id: 'ai-assistant', label: 'AI Quant Assistant', icon: <Bot className="w-3.5 h-3.5 text-cyan-400 mr-1.5" /> }
  ];

  return (
    <header className="sticky top-0 z-50 terminal-card border-b border-slate-800 bg-[#080c14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/10">
              <Terminal className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-white tracking-tight font-mono">QuantFinance</h1>
                <span className="text-[10px] font-semibold font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  INR Edition v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Multi-Asset Financial Intelligence Engine</p>
            </div>
          </div>

          {/* Section Quick Links */}
          <nav className="hidden lg:flex space-x-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeSection === item.id
                    ? 'bg-sky-500 text-slate-950 font-semibold shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Data Status & FX Rate Badge */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-900 border border-cyan-800/80 text-cyan-400 text-xs font-mono">
              <IndianRupee className="w-3.5 h-3.5 text-cyan-400" />
              <span>1 USD = ₹{DEFAULT_USD_TO_INR.toFixed(2)} INR</span>
            </div>

            <div className="hidden md:flex items-center space-x-1 text-[11px] text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTimeStr}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}

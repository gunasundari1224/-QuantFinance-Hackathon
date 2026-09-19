import React from 'react';
import { Activity, ShieldCheck, TrendingUp, Grid, PieChart } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="sticky top-0 z-50 glass-card border-b border-gray-800 bg-[#0b0f19]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-emerald-500 to-yellow-500 p-[2px]">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-white tracking-wide">QuantIntelligence</h1>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  MVP v1.0
                </span>
              </div>
              <p className="text-xs text-gray-400">Multi-Asset Quantitative Engine & Backtester</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex space-x-1 sm:space-x-2 bg-gray-900/80 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25 font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Technical & Returns</span>
            </button>

            <button
              onClick={() => setActiveTab('backtest')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'backtest'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25 font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Backtest Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('correlation')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'correlation'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25 font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Cross-Asset Correlation</span>
            </button>

            <button
              onClick={() => setActiveTab('regime')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'regime'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25 font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Market Regime</span>
            </button>
          </nav>

          {/* System Status Pill */}
          <div className="hidden md:flex items-center space-x-2 bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 px-3 py-1 rounded-full text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Seeded Demo Data Ready</span>
          </div>

        </div>
      </div>
    </header>
  );
}

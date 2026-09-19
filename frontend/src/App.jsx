import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MetricsHeader from './components/MetricsHeader';
import StrategyControls from './components/StrategyControls';
import PriceChart from './components/PriceChart';
import EquityCurveChart from './components/EquityCurveChart';
import CorrelationHeatmap from './components/CorrelationHeatmap';
import RegimeCard from './components/RegimeCard';
import TradeLogTable from './components/TradeLogTable';
import { api } from './services/api';
import { formatPercent, formatCurrency, formatNumber } from './utils/formatters';
import { AlertCircle, RefreshCw, Layers } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'backtest', 'correlation', 'regime'
  const [selectedAsset, setSelectedAsset] = useState('BTC-USD');
  const [selectedStrategy, setSelectedStrategy] = useState('SMA_CROSSOVER');
  const [strategyParams, setStrategyParams] = useState({ fast_period: 10, slow_period: 50, momentum_period: 20, threshold_pct: 0.02, lookback_period: 20, z_threshold: 1.5 });
  const [initialCapital, setInitialCapital] = useState(100000);
  const [transactionCostPct, setTransactionCostPct] = useState(0.001); // 0.1%
  const [startDate, setStartDate] = useState('2021-01-01');
  const [endDate, setEndDate] = useState('2026-09-01');

  // State holdings
  const [indicatorData, setIndicatorData] = useState([]);
  const [metricsData, setMetricsData] = useState(null);
  const [correlationData, setCorrelationData] = useState(null);
  const [regimeData, setRegimeData] = useState(null);
  const [backtestResult, setBacktestResult] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load Asset Analytics & Indicators
  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fastP = strategyParams.fast_period || 10;
      const slowP = strategyParams.slow_period || 50;
      const [indRes, metRes, regRes] = await Promise.all([
        api.calculateIndicators(selectedAsset, [fastP, slowP], [12, 26], startDate, endDate),
        api.analyzeMetrics(selectedAsset, startDate, endDate),
        api.detectRegime(selectedAsset, startDate, endDate)
      ]);
      setIndicatorData(indRes.data || []);
      setMetricsData(metRes.metrics || null);
      setRegimeData(regRes || null);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Could not connect to backend server. Ensure FastAPI is running on port 8000.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load Cross-Asset Correlation
  const loadCorrelation = async () => {
    try {
      const corrRes = await api.getCorrelationMatrix(['GC=F', 'BTC-USD', 'NVDA', 'SPY'], startDate, endDate);
      setCorrelationData(corrRes);
    } catch (err) {
      console.error('Failed to fetch correlation matrix:', err);
    }
  };

  // Execute Backtest
  const handleRunBacktest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        symbol: selectedAsset,
        strategy: selectedStrategy,
        parameters: strategyParams,
        initial_capital: initialCapital,
        transaction_cost_pct: transactionCostPct,
        slippage_pct: 0.0005,
        start_date: startDate,
        end_date: endDate
      };
      const res = await api.runBacktest(payload);
      setBacktestResult(res);
    } catch (err) {
      console.error('Backtest error:', err);
      setError(err.response?.data?.detail || 'Error executing strategy backtest.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    loadCorrelation();
    handleRunBacktest();
  }, [selectedAsset, startDate, endDate]);

  useEffect(() => {
    handleRunBacktest();
  }, [selectedStrategy]);

  const latestPrice = indicatorData.length > 0 ? indicatorData[indicatorData.length - 1].close : 0;

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="text-xs font-medium">{error}</span>
            </div>
            <button 
              onClick={() => { loadAnalytics(); handleRunBacktest(); }}
              className="flex items-center space-x-1 px-3 py-1 bg-rose-900 hover:bg-rose-800 text-xs rounded-lg text-white font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
            </button>
          </div>
        )}

        {/* Top Quantitative KPI Cards Header */}
        <MetricsHeader symbol={selectedAsset} metrics={metricsData} latestPrice={latestPrice} />

        {/* Global Strategy & Parameter Controls */}
        <StrategyControls
          selectedAsset={selectedAsset}
          setSelectedAsset={setSelectedAsset}
          selectedStrategy={selectedStrategy}
          setSelectedStrategy={setSelectedStrategy}
          strategyParams={strategyParams}
          setStrategyParams={setStrategyParams}
          initialCapital={initialCapital}
          setInitialCapital={setInitialCapital}
          transactionCostPct={transactionCostPct}
          setTransactionCostPct={setTransactionCostPct}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onRunBacktest={handleRunBacktest}
          isLoading={isLoading}
        />

        {/* Tab 1: Technical Indicators & Returns */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <PriceChart 
              data={indicatorData} 
              markers={backtestResult?.trade_markers || []} 
              smaFastKey={`SMA_${strategyParams.fast_period || 10}`} 
              smaSlowKey={`SMA_${strategyParams.slow_period || 50}`} 
            />

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-5 rounded-xl border border-gray-800">
                <h4 className="text-xs uppercase font-semibold text-gray-400 tracking-wider mb-3">Daily Return Distribution</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Daily log and percentage return series calculated over {indicatorData.length} daily observations. High skewness or fat tails indicate jump risk in assets like BTC.
                </p>
              </div>
              <div className="glass-card p-5 rounded-xl border border-gray-800">
                <h4 className="text-xs uppercase font-semibold text-gray-400 tracking-wider mb-3">Volatility & Risk Window</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  252-day annualized standard deviation of daily returns. Useful for risk-adjusted position sizing and volatility targeting.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Algorithmic Backtesting Engine */}
        {activeTab === 'backtest' && (
          <div className="space-y-6">
            {backtestResult?.summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-2">
                
                <div className="glass-card p-4 rounded-xl border border-gray-800">
                  <div className="text-xs text-gray-400 font-medium">Strategy Final Capital</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">
                    {formatCurrency(backtestResult.summary.final_capital)}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    Total Return: <span className="text-emerald-400 font-semibold">{formatPercent(backtestResult.summary.total_return_pct)}</span>
                  </div>
                </div>

                <div className="glass-card p-4 rounded-xl border border-gray-800">
                  <div className="text-xs text-gray-400 font-medium">Buy & Hold Benchmark</div>
                  <div className="text-lg font-bold text-slate-300 mt-1">
                    {formatPercent(backtestResult.summary.benchmark_return_pct)}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    Alpha Excess: <span className="text-cyan-400 font-semibold">{formatPercent(backtestResult.summary.total_return_pct - backtestResult.summary.benchmark_return_pct)}</span>
                  </div>
                </div>

                <div className="glass-card p-4 rounded-xl border border-gray-800">
                  <div className="text-xs text-gray-400 font-medium">Win Rate & Trades</div>
                  <div className="text-lg font-bold text-white mt-1">
                    {formatPercent(backtestResult.summary.win_rate_pct)}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    Total Trades: <span className="text-yellow-400 font-semibold">{backtestResult.summary.total_trades}</span>
                  </div>
                </div>

                <div className="glass-card p-4 rounded-xl border border-gray-800">
                  <div className="text-xs text-gray-400 font-medium">Profit Factor</div>
                  <div className="text-lg font-bold text-yellow-400 mt-1">
                    {formatNumber(backtestResult.summary.profit_factor)}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    Max Drawdown: <span className="text-rose-400 font-semibold">-{backtestResult.summary.max_drawdown_pct}%</span>
                  </div>
                </div>

              </div>
            )}

            {/* Equity Curve Comparison Chart */}
            <EquityCurveChart equityData={backtestResult?.equity_curve || []} />

            {/* Executed Trade Log Table */}
            <TradeLogTable trades={backtestResult?.trades || []} />
          </div>
        )}

        {/* Tab 3: Cross-Asset Correlation */}
        {activeTab === 'correlation' && (
          <CorrelationHeatmap matrixData={correlationData?.matrix} rollingData={correlationData?.rolling_correlation} />
        )}

        {/* Tab 4: Market Regime */}
        {activeTab === 'regime' && (
          <RegimeCard regimeData={regimeData} symbol={selectedAsset} />
        )}

      </main>

      {/* Footer */}
      <footer className="glass-card border-t border-gray-800 mt-auto py-4 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between">
          <span>Quantitative Multi-Asset Financial Intelligence & Backtesting Platform</span>
          <span className="mt-2 sm:mt-0 text-gray-400 font-mono">FastAPI Python Engine + React 18 Canvas UI</span>
        </div>
      </footer>
    </div>
  );
}

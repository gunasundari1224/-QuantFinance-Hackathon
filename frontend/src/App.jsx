import React, { useState, useEffect } from 'react';
import TopNav from './components/TopNav';
import PortfolioKPIRow from './components/PortfolioKPIRow';
import MultiAssetCards from './components/MultiAssetCards';
import StrategyComparisonGrid from './components/StrategyComparisonGrid';
import PriceChart from './components/PriceChart';
import EquityCurvePanel from './components/EquityCurvePanel';
import CorrelationHeatmapSection from './components/CorrelationHeatmapSection';
import RiskAnalyticsSection from './components/RiskAnalyticsSection';
import MarketRegimeSection from './components/MarketRegimeSection';
import TradeStatisticsPanel from './components/TradeStatisticsPanel';
import TradeLogSection from './components/TradeLogSection';
import StrategyControls from './components/StrategyControls';
import AIQuantAssistantPanel from './components/AIQuantAssistantPanel';

import { api } from './services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState('overview'); // 'overview', 'analysis', 'backtest', 'comparison', 'risk', 'ai-assistant'
  const [selectedAsset, setSelectedAsset] = useState('BTC-USD');
  const [selectedStrategy, setSelectedStrategy] = useState('SMA_CROSSOVER');
  const [strategyParams, setStrategyParams] = useState({ 
    fast_period: 10, 
    slow_period: 50, 
    momentum_period: 20, 
    threshold_pct: 0.02, 
    lookback_period: 20, 
    z_threshold: 1.5 
  });
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
  const [multiAssetData, setMultiAssetData] = useState({});
  const [comparisonResults, setComparisonResults] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch Multi-Asset summary data for Gold, BTC, NVDA, SPY cards
  const loadMultiAssetSummary = async () => {
    const symbols = ['BTC-USD', 'NVDA', 'GC=F', 'SPY'];
    const summaryMap = {};
    try {
      await Promise.all(
        symbols.map(async (sym) => {
          try {
            const res = await api.analyzeMetrics(sym, startDate, endDate);
            const hist = await api.getAssetHistory(sym, startDate, endDate);
            const latestPrice = hist.data && hist.data.length > 0 ? hist.data[hist.data.length - 1].Close : 0;
            summaryMap[sym] = {
              ...res.metrics,
              latestPrice
            };
          } catch (e) {
            console.warn(`Failed summary fetch for ${sym}:`, e);
          }
        })
      );
      setMultiAssetData(summaryMap);
    } catch (err) {
      console.error('Multi-asset summary fetch error:', err);
    }
  };

  // 2. Fetch active asset analytics (Indicators, Metrics, Regimes)
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
      setError('Could not connect to FastAPI backend server. Verify http://127.0.0.1:8000 is active.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Fetch cross-asset correlation matrix
  const loadCorrelation = async () => {
    try {
      const corrRes = await api.getCorrelationMatrix(['GC=F', 'BTC-USD', 'NVDA', 'SPY'], startDate, endDate);
      setCorrelationData(corrRes);
    } catch (err) {
      console.error('Failed to fetch correlation matrix:', err);
    }
  };

  // 4. Run strategy backtest & comparison matrix across all 4 strategies
  const handleRunBacktest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const activePayload = {
        symbol: selectedAsset,
        strategy: selectedStrategy,
        parameters: strategyParams,
        initial_capital: initialCapital,
        transaction_cost_pct: transactionCostPct,
        slippage_pct: 0.0005,
        start_date: startDate,
        end_date: endDate
      };

      const res = await api.runBacktest(activePayload);
      setBacktestResult(res);

      // Run parallel backtests for all 4 strategies to populate the comparison grid
      const allStrategies = ['SMA_CROSSOVER', 'EMA_TREND', 'MOMENTUM', 'MEAN_REVERSION'];
      const compMap = {};
      await Promise.all(
        allStrategies.map(async (stratId) => {
          try {
            const compRes = await api.runBacktest({
              ...activePayload,
              strategy: stratId
            });
            compMap[stratId] = compRes.summary;
          } catch (e) {
            console.warn(`Comparison run failed for ${stratId}:`, e);
          }
        })
      );
      setComparisonResults(compMap);

    } catch (err) {
      console.error('Backtest error:', err);
      setError(err.response?.data?.detail || 'Error executing strategy backtest.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMultiAssetSummary();
    loadAnalytics();
    loadCorrelation();
    handleRunBacktest();
  }, [selectedAsset, startDate, endDate]);

  useEffect(() => {
    handleRunBacktest();
  }, [selectedStrategy]);

  return (
    <div className="min-h-screen terminal-bg text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Navigation Bar */}
      <TopNav activeSection={activeSection} setActiveSection={setActiveSection} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        
        {/* Error State Banner */}
        {error && (
          <div className="p-3.5 rounded-lg bg-rose-950/90 border border-rose-800 text-rose-300 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button 
              onClick={() => { loadAnalytics(); handleRunBacktest(); }}
              className="flex items-center space-x-1 px-3 py-1 bg-rose-900 hover:bg-rose-800 text-xs rounded text-white font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
            </button>
          </div>
        )}

        {/* TAB 1: TERMINAL OVERVIEW */}
        {activeSection === 'overview' && (
          <div className="space-y-4">
            <PortfolioKPIRow 
              backtestSummary={backtestResult?.summary} 
              initialCapital={initialCapital} 
            />
            <MultiAssetCards
              multiAssetData={multiAssetData}
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
              selectedStrategy={selectedStrategy}
            />
            <PriceChart 
              data={indicatorData} 
              markers={backtestResult?.trade_markers || []} 
              smaFastKey={`SMA_${strategyParams.fast_period || 10}`} 
              smaSlowKey={`SMA_${strategyParams.slow_period || 50}`} 
            />
            <StrategyComparisonGrid
              comparisonResults={comparisonResults}
              selectedStrategy={selectedStrategy}
              setSelectedStrategy={setSelectedStrategy}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* TAB 2: MARKET ANALYSIS */}
        {activeSection === 'analysis' && (
          <div className="space-y-4">
            <MultiAssetCards
              multiAssetData={multiAssetData}
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
              selectedStrategy={selectedStrategy}
            />
            <PriceChart 
              data={indicatorData} 
              markers={backtestResult?.trade_markers || []} 
              smaFastKey={`SMA_${strategyParams.fast_period || 10}`} 
              smaSlowKey={`SMA_${strategyParams.slow_period || 50}`} 
            />
            <MarketRegimeSection regimeData={regimeData} symbol={selectedAsset} />
          </div>
        )}

        {/* TAB 3: BACKTEST ENGINE */}
        {activeSection === 'backtest' && (
          <div className="space-y-4">
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
            <EquityCurvePanel equityData={backtestResult?.equity_curve || []} />
            <TradeStatisticsPanel backtestSummary={backtestResult?.summary} trades={backtestResult?.trades || []} />
            <TradeLogSection trades={backtestResult?.trades || []} />
          </div>
        )}

        {/* TAB 4: STRATEGY MATRIX */}
        {activeSection === 'comparison' && (
          <div className="space-y-4">
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
            <StrategyComparisonGrid
              comparisonResults={comparisonResults}
              selectedStrategy={selectedStrategy}
              setSelectedStrategy={setSelectedStrategy}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* TAB 5: RISK & REGIMES */}
        {activeSection === 'risk' && (
          <div className="space-y-4">
            <CorrelationHeatmapSection correlationData={correlationData} />
            <RiskAnalyticsSection metrics={metricsData} symbol={selectedAsset} />
            <MarketRegimeSection regimeData={regimeData} symbol={selectedAsset} />
          </div>
        )}

        {/* TAB 6: AI QUANT ASSISTANT */}
        {activeSection === 'ai-assistant' && (
          <div className="space-y-4">
            <AIQuantAssistantPanel
              selectedAsset={selectedAsset}
              selectedStrategy={selectedStrategy}
              strategyParams={strategyParams}
              startDate={startDate}
              endDate={endDate}
              backtestResult={backtestResult}
              regimeData={regimeData}
              metricsData={metricsData}
            />
          </div>
        )}

      </main>

      {/* Terminal Footer */}
      <footer className="terminal-card border-t border-slate-800 mt-auto py-3.5 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between">
          <span>QuantFinance Institutional Intelligence Terminal</span>
          <span className="mt-1 sm:mt-0 text-slate-400">FastAPI Python Quantitative Engine • React 18 Canvas Dashboard</span>
        </div>
      </footer>
    </div>
  );
}

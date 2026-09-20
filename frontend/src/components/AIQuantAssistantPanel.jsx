import React, { useState } from 'react';
import { Bot, Sparkles, Send, ShieldAlert, Cpu, Trash2, Loader2, User } from 'lucide-react';
import { api } from '../services/api';

export default function AIQuantAssistantPanel({ selectedAsset, selectedStrategy, strategyParams, startDate, endDate, backtestResult, regimeData, metricsData }) {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const suggestedQuestions = [
    "Summarize this backtest.",
    "Why did this strategy perform this way?",
    "Compare this strategy with Buy & Hold.",
    "Explain the current risk metrics.",
    "How did this strategy behave during high volatility?",
    "What happened to the portfolio during the selected period?"
  ];

  // Constructs full factual context payload from actual application state
  const buildContextPayload = () => {
    const summary = backtestResult?.summary || {};
    const currentRegime = regimeData?.regime_series && regimeData.regime_series.length > 0
      ? regimeData.regime_series[regimeData.regime_series.length - 1].regime
      : 'Unknown';

    return {
      selected_asset: selectedAsset,
      selected_strategy: selectedStrategy,
      strategy_parameters: strategyParams,
      date_range: `${startDate} to ${endDate}`,
      portfolio_summary: {
        initial_capital: summary.initial_capital,
        final_capital: summary.final_capital,
        net_return_pct: summary.total_return_pct,
        benchmark_return_pct: summary.benchmark_return_pct,
        cagr_pct: summary.cagr_pct,
        annualized_volatility_pct: summary.annualized_volatility ? (summary.annualized_volatility * 100).toFixed(2) : '0',
        sharpe_ratio: summary.sharpe_ratio,
        max_drawdown_pct: summary.max_drawdown_pct,
        total_trades: summary.total_trades,
        win_rate_pct: summary.win_rate_pct,
        profit_factor: summary.profit_factor
      },
      asset_metrics: metricsData || {},
      active_market_regime: currentRegime,
      regime_breakdown_pct: regimeData?.regime_breakdown_pct || {}
    };
  };

  const handleSendQuestion = async (textToSend) => {
    const queryText = (textToSend || question).trim();
    if (!queryText || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    const userMessage = { role: 'user', content: queryText, timestamp: new Date().toLocaleTimeString() };
    setChatHistory(prev => [...prev, userMessage]);
    setQuestion('');

    try {
      const context = buildContextPayload();
      const res = await api.askAI(queryText, context);

      if (res.success) {
        const aiMessage = {
          role: 'assistant',
          content: res.answer,
          model: res.model,
          timestamp: new Date().toLocaleTimeString()
        };
        setChatHistory(prev => [...prev, aiMessage]);
      } else {
        setErrorMessage(res.error || 'Failed to generate AI explanation.');
      }
    } catch (err) {
      console.error('AI Query error:', err);
      const errDetail = err.response?.data?.detail || err.response?.data?.error || 'Could not connect to Gemini AI backend service.';
      setErrorMessage(errDetail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setChatHistory([]);
    setErrorMessage(null);
  };

  return (
    <div className="terminal-card p-5 my-4 border border-cyan-500/30 bg-slate-900/90 shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3.5 mb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/10">
            <Bot className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white font-mono">🤖 AI Quant Assistant</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 flex items-center font-mono">
                <Cpu className="w-3 h-3 mr-1 text-purple-400" /> Powered by Google Gemini API
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ask questions about historical strategy performance, risk metrics and market regimes.
            </p>
          </div>
        </div>

        {chatHistory.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="mt-2 md:mt-0 flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear Chat</span>
          </button>
        )}
      </div>

      {/* Suggested Question Prompt Pills */}
      <div className="mb-4">
        <label className="block text-[11px] font-mono text-slate-400 mb-2">Suggested Research Questions:</label>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuestion(q)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-md text-xs font-medium border bg-slate-900/80 text-slate-300 border-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 transition-all text-left disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3 text-cyan-400 inline mr-1.5" />
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      {chatHistory.length > 0 && (
        <div className="mb-4 space-y-3 max-h-96 overflow-y-auto p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${
                msg.role === 'user'
                  ? 'bg-slate-900/90 border-slate-700 text-slate-200 ml-6'
                  : 'bg-cyan-950/30 border-cyan-800/80 text-cyan-100 mr-6'
              }`}
            >
              <div className="flex items-center justify-between mb-1 text-[10px] text-slate-400">
                <span className="font-bold flex items-center">
                  {msg.role === 'user' ? (
                    <><User className="w-3 h-3 mr-1 text-slate-300" /> User Query</>
                  ) : (
                    <><Bot className="w-3 h-3 mr-1 text-cyan-400" /> AI Assistant ({msg.model})</>
                  )}
                </span>
                <span>{msg.timestamp}</span>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed text-xs">
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="p-3 mb-4 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 text-xs font-mono flex items-center space-x-2 animate-pulse">
          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>Analyzing backtest metrics and querying Gemini API...</span>
        </div>
      )}

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="p-3 mb-4 rounded-lg bg-rose-950/90 border border-rose-800 text-rose-300 text-xs font-mono flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Question Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuestion();
        }}
        className="relative mb-3"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask questions about calculated results, strategy behavior, or market risk..."
          className="w-full terminal-input text-xs rounded-lg py-3 pl-4 pr-12 font-mono"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="absolute right-2 top-2 p-1.5 bg-cyan-500 text-slate-950 rounded-md hover:bg-cyan-400 transition-colors disabled:opacity-40"
          title="Submit question to Gemini"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </form>

      {/* Disclaimer */}
      <div className="text-[10px] text-slate-400 font-mono text-center">
        AI-generated explanation based on historical application data. Not financial advice.
      </div>

    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { Activity, ShieldAlert } from 'lucide-react';
import { convertUSDtoINR } from '../utils/formatters';

export default function EquityCurvePanel({ equityData }) {
  const equityChartRef = useRef(null);
  const drawdownChartRef = useRef(null);

  useEffect(() => {
    if (!equityChartRef.current || !equityData || equityData.length === 0) return;

    // 1. Primary Equity Curve Chart (Converted to INR)
    equityChartRef.current.innerHTML = '';
    const equityChart = createChart(equityChartRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#94a3b8',
        fontSize: 11,
        fontFamily: 'JetBrains Mono, monospace'
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' }
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        textColor: '#94a3b8'
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        timeVisible: true
      },
      height: 320
    });

    // Strategy Equity Series (₹ INR)
    const stratSeries = equityChart.addLineSeries({
      color: '#10b981', // Emerald Green
      lineWidth: 2.5,
      title: 'Strategy Equity (₹ INR)'
    });
    stratSeries.setData(equityData.map(d => ({ time: d.date, value: convertUSDtoINR(d.strategy) })));

    // Benchmark Equity Series (₹ INR)
    const benchSeries = equityChart.addLineSeries({
      color: '#64748b', // Slate Gray
      lineWidth: 1.5,
      lineStyle: 2, // Dashed
      title: 'Buy & Hold Benchmark (₹ INR)'
    });
    benchSeries.setData(equityData.map(d => ({ time: d.date, value: convertUSDtoINR(d.benchmark) })));

    equityChart.timeScale().fitContent();

    // 2. Drawdown Sub-Chart (Drawdown % remains percentage)
    if (drawdownChartRef.current) {
      drawdownChartRef.current.innerHTML = '';
      const ddChart = createChart(drawdownChartRef.current, {
        layout: {
          background: { color: 'transparent' },
          textColor: '#94a3b8',
          fontSize: 10,
          fontFamily: 'JetBrains Mono, monospace'
        },
        grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.03)' }
        },
        rightPriceScale: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
          textColor: '#94a3b8'
        },
        timeScale: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
          timeVisible: true
        },
        height: 140
      });

      const ddSeries = ddChart.addAreaSeries({
        topColor: 'rgba(244, 63, 94, 0.4)',
        bottomColor: 'rgba(244, 63, 94, 0.02)',
        lineColor: '#f43f5e',
        lineWidth: 1.5,
        title: 'Drawdown Depth (%)'
      });
      ddSeries.setData(equityData.map(d => ({ time: d.date, value: d.drawdown })));
      ddChart.timeScale().fitContent();

      const handleResize = () => {
        if (equityChartRef.current && drawdownChartRef.current) {
          equityChart.applyOptions({ width: equityChartRef.current.clientWidth });
          ddChart.applyOptions({ width: drawdownChartRef.current.clientWidth });
        }
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        equityChart.remove();
        ddChart.remove();
      };
    }
  }, [equityData]);

  return (
    <div className="terminal-card p-4 my-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-bold text-white flex items-center font-mono">
          <Activity className="w-4 h-4 text-emerald-400 mr-2" />
          Equity Growth (₹ INR) & Drawdown Depth Analysis
        </h3>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <span className="flex items-center text-emerald-400">
            <span className="w-2.5 h-0.5 bg-emerald-400 mr-1.5 inline-block"></span> Selected Strategy (₹)
          </span>
          <span className="flex items-center text-slate-400">
            <span className="w-2.5 h-0.5 border-b border-dashed border-slate-400 mr-1.5 inline-block"></span> Buy & Hold (₹)
          </span>
          <span className="flex items-center text-rose-400">
            <span className="w-2.5 h-2.5 bg-rose-500/30 border border-rose-500 rounded-sm mr-1.5 inline-block"></span> Drawdown (%)
          </span>
        </div>
      </div>

      {/* Primary Equity Curve Pane */}
      <div ref={equityChartRef} className="w-full h-[320px]" />

      {/* Drawdown Sub-Pane Header */}
      <div className="flex items-center space-x-1 text-xs text-rose-400 font-semibold font-mono mt-3 mb-1 px-1">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>Peak-to-Trough Drawdown (%)</span>
      </div>

      {/* Drawdown Sub-Pane Chart */}
      <div ref={drawdownChartRef} className="w-full h-[140px]" />
    </div>
  );
}

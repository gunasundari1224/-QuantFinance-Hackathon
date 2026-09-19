import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

export default function EquityCurveChart({ equityData }) {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current || !equityData || equityData.length === 0) return;

    chartContainerRef.current.innerHTML = '';

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#9ca3af',
        fontSize: 12,
        fontFamily: 'Inter, sans-serif'
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' }
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textColor: '#9ca3af'
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true
      },
      height: 380
    });

    // Strategy Equity Line
    const strategySeries = chart.addLineSeries({
      color: '#10b981', // Emerald
      lineWidth: 2.5,
      title: 'Strategy Equity ($)'
    });
    strategySeries.setData(equityData.map(d => ({ time: d.date, value: d.strategy })));

    // Benchmark Equity Line
    const benchmarkSeries = chart.addLineSeries({
      color: '#64748b', // Slate Gray
      lineWidth: 1.5,
      lineStyle: 2, // Dashed
      title: 'Buy & Hold Benchmark ($)'
    });
    benchmarkSeries.setData(equityData.map(d => ({ time: d.date, value: d.benchmark })));

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [equityData]);

  return (
    <div className="glass-card rounded-xl p-4 border border-gray-800 my-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-white flex items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2"></span>
          Strategy Equity vs Buy & Hold Benchmark
        </h3>
        <div className="flex items-center space-x-4 text-xs">
          <span className="flex items-center text-emerald-400 font-medium">
            <span className="w-3 h-0.5 bg-emerald-400 mr-1.5 inline-block"></span> Algorithmic Strategy
          </span>
          <span className="flex items-center text-slate-400 font-medium">
            <span className="w-3 h-0.5 border-b border-dashed border-slate-400 mr-1.5 inline-block"></span> Buy & Hold Benchmark
          </span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-[380px]" />
    </div>
  );
}

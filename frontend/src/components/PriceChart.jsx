import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

export default function PriceChart({ data, markers = [], smaFastKey = 'SMA_20', smaSlowKey = 'SMA_50' }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    // Clear previous chart
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
      crosshair: {
        mode: 1,
        vertLine: { color: '#06b6d4', width: 1, style: 2 },
        horzLine: { color: '#06b6d4', width: 1, style: 2 }
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textColor: '#9ca3af'
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false
      },
      handleScroll: true,
      handleScale: true,
      height: 420
    });

    chartRef.current = chart;

    // Price Series Line
    const priceSeries = chart.addLineSeries({
      color: '#38bdf8',
      lineWidth: 2,
      title: 'Price ($)'
    });

    const priceData = data.map(item => ({
      time: item.date,
      value: item.close
    }));
    priceSeries.setData(priceData);

    // Fast SMA Overlay
    if (data[0] && data[0][smaFastKey] !== undefined) {
      const fastSmaSeries = chart.addLineSeries({
        color: '#eab308', // Gold
        lineWidth: 1.5,
        title: smaFastKey
      });
      fastSmaSeries.setData(data.map(item => ({
        time: item.date,
        value: item[smaFastKey]
      })));
    }

    // Slow SMA Overlay
    if (data[0] && data[0][smaSlowKey] !== undefined) {
      const slowSmaSeries = chart.addLineSeries({
        color: '#8b5cf6', // Purple
        lineWidth: 1.5,
        title: smaSlowKey
      });
      slowSmaSeries.setData(data.map(item => ({
        time: item.date,
        value: item[smaSlowKey]
      })));
    }

    // Buy / Sell Trade Markers
    if (markers && markers.length > 0) {
      const chartMarkers = markers.map(m => ({
        time: m.date,
        position: m.signal === 'BUY' ? 'belowBar' : 'aboveBar',
        color: m.signal === 'BUY' ? '#10b981' : '#f43f5e',
        shape: m.signal === 'BUY' ? 'arrowUp' : 'arrowDown',
        text: m.signal === 'BUY' ? 'BUY' : 'SELL'
      }));
      priceSeries.setMarkers(chartMarkers);
    }

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
  }, [data, markers, smaFastKey, smaSlowKey]);

  return (
    <div className="glass-card rounded-xl p-4 border border-gray-800 my-4 relative">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-white flex items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mr-2"></span>
          Asset Price & Moving Average Overlays
        </h3>
        <div className="flex items-center space-x-4 text-xs">
          <span className="flex items-center text-cyan-400 font-medium">
            <span className="w-3 h-0.5 bg-cyan-400 mr-1.5 inline-block"></span> Price
          </span>
          <span className="flex items-center text-yellow-400 font-medium">
            <span className="w-3 h-0.5 bg-yellow-400 mr-1.5 inline-block"></span> {smaFastKey}
          </span>
          <span className="flex items-center text-purple-400 font-medium">
            <span className="w-3 h-0.5 bg-purple-400 mr-1.5 inline-block"></span> {smaSlowKey}
          </span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-[420px]" />
    </div>
  );
}

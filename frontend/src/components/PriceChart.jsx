import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { TrendingUp } from 'lucide-react';
import { DEFAULT_USD_TO_INR, convertUSDtoINR, formatINR } from '../utils/formatters';

export default function PriceChart({ data, markers = [], smaFastKey = 'SMA_20', smaSlowKey = 'SMA_50' }) {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    chartContainerRef.current.innerHTML = '';

    const chart = createChart(chartContainerRef.current, {
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
      crosshair: {
        mode: 1,
        vertLine: { color: '#38bdf8', width: 1, style: 2 },
        horzLine: { color: '#38bdf8', width: 1, style: 2 }
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        textColor: '#94a3b8'
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        timeVisible: true,
        secondsVisible: false
      },
      handleScroll: true,
      handleScale: true,
      height: 420
    });

    // Price Series Line (Converted to INR)
    const priceSeries = chart.addLineSeries({
      color: '#38bdf8',
      lineWidth: 2,
      title: 'Price (₹ INR)'
    });

    const priceData = data.map(item => ({
      time: item.date,
      value: convertUSDtoINR(item.close)
    }));
    priceSeries.setData(priceData);

    // Fast SMA Overlay (Converted to INR)
    if (data[0] && data[0][smaFastKey] !== undefined) {
      const fastSmaSeries = chart.addLineSeries({
        color: '#eab308', // Gold
        lineWidth: 1.5,
        title: `${smaFastKey} (₹)`
      });
      fastSmaSeries.setData(data.map(item => ({
        time: item.date,
        value: convertUSDtoINR(item[smaFastKey])
      })));
    }

    // Slow SMA Overlay (Converted to INR)
    if (data[0] && data[0][smaSlowKey] !== undefined) {
      const slowSmaSeries = chart.addLineSeries({
        color: '#a855f7', // Purple
        lineWidth: 1.5,
        title: `${smaSlowKey} (₹)`
      });
      slowSmaSeries.setData(data.map(item => ({
        time: item.date,
        value: convertUSDtoINR(item[smaSlowKey])
      })));
    }

    // Buy / Sell Trade Execution Markers
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
    <div className="terminal-card p-4 my-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-bold text-white flex items-center font-mono">
          <TrendingUp className="w-4 h-4 text-sky-400 mr-2" />
          Interactive Price Action & Moving Average Overlays (₹ INR)
        </h3>
        <div className="flex items-center space-x-4 text-xs font-mono">
          <span className="flex items-center text-sky-400 font-medium">
            <span className="w-2.5 h-0.5 bg-sky-400 mr-1.5 inline-block"></span> Price (₹ INR)
          </span>
          <span className="flex items-center text-yellow-400 font-medium">
            <span className="w-2.5 h-0.5 bg-yellow-400 mr-1.5 inline-block"></span> {smaFastKey} (₹)
          </span>
          <span className="flex items-center text-purple-400 font-medium">
            <span className="w-2.5 h-0.5 bg-purple-400 mr-1.5 inline-block"></span> {smaSlowKey} (₹)
          </span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-[420px]" />
    </div>
  );
}

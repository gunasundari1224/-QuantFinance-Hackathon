# Quantitative Multi-Asset Financial Intelligence & Backtesting Platform

A high-performance, full-stack quantitative financial intelligence, risk analytics, and algorithmic backtesting engine built for **Gold (XAU)**, **Bitcoin (BTC)**, **NVIDIA (NVDA)**, and **S&P 500 (SPY)**.

Designed for college hackathon demonstrations with guaranteed 100% offline reliability (seeded daily datasets) and optional live market data fetching via `yfinance`.

---

## Key Features

1. **Multi-Asset Quantitative Analytics**:
   - **Simple Moving Averages (SMA)** & **Exponential Moving Averages (EMA)**
   - **Daily, Cumulative & 30-Day Rolling Returns**
   - **Annualized Volatility (252-day standard deviation)**
   - **Sharpe Ratio (Annualized risk-adjusted returns)**
   - **Maximum Drawdown (Peak-to-trough drop %)**
   - **Compound Annual Growth Rate (CAGR %)**

2. **Lookahead-Free Algorithmic Backtester**:
   - **Shift-Based Execution**: Signals at bar $t$ strictly execute on bar $t+1$ to eliminate lookahead bias and data leakage.
   - **Realistic Friction Simulator**: Deducts percentage transaction commissions (e.g. 0.1%) and market slippage (0.05%) on trade entry/exit.
   - **4 Algorithmic Strategies**:
     - **SMA Crossover Strategy**
     - **EMA Trend Strategy**
     - **Momentum Strategy**
     - **Mean Reversion Strategy** (Z-score deviation)
   - **Buy & Hold Benchmark Comparison**: Real-time equity curve benchmarking against asset Buy & Hold re-based to starting capital ($100,000 baseline).
   - **Comprehensive Trade Log**: Entry/exit dates, entry/exit prices, fees, PnL $, PnL %, win rate %, and profit factor.

3. **Cross-Asset Correlation Engine**:
   - Interactive $N \times N$ Pearson correlation heatmap across Gold, Bitcoin, NVIDIA, and S&P 500.
   - 30-day rolling correlation time-series analysis for systemic risk hedging.

4. **Market Regime Classification**:
   - Classifies market bars into **Bull Market**, **Bear Market**, **High Volatility**, and **Low Volatility** regimes.

5. **Futuristic Financial UI**:
   - Built with React 18, Vite, Tailwind CSS (Dark Glassmorphic aesthetic).
   - Canvas-rendered 60 FPS charts using TradingView's `lightweight-charts` with Buy/Sell execution markers.

---

## Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

---

### Step 1: Launch FastAPI Backend Server

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Generate / verify seeded daily datasets
python ../data_scripts/generate_seed_data.py

# Run unit tests
pytest tests

# Launch backend server on http://127.0.0.1:8000
python run.py
```

The backend interactive API docs will be available at: `http://127.0.0.1:8000/docs`

---

### Step 2: Launch React Frontend Dashboard

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Run Vite dev server on http://localhost:5173
npm run dev
```

Open your browser at: `http://localhost:5173`

---

## Running Verification Tests

- **Backend Pytest Suite**:
  ```bash
  pytest backend/tests
  ```
- **Frontend Production Build Test**:
  ```bash
  cd frontend
  npm run build
  ```

---

## System Architecture

```
React 18 + Vite Dashboard (Port 5173)
           │
           ▼ HTTP / REST (JSON)
FastAPI Python Server (Port 8000)
     ├── Data Engine (yfinance + Local Seeded CSV Fallback)
     ├── Quant Engine (SMA, EMA, Volatility, Sharpe, Max Drawdown)
     ├── Correlation & Market Regime Classifier
     └── Lookahead-Free Backtester Engine (Fees, Slippage, Buy & Hold Overlay)
```

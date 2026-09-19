import os
import pandas as pd
import numpy as np
from datetime import datetime

# Directory for seed data
SEED_DIR = os.path.join(os.path.dirname(__file__), "..", "backend", "app", "data", "seed_data")
os.makedirs(SEED_DIR, exist_ok=True)

# List of target assets
ASSETS = {
    "BTC-USD": {"name": "Bitcoin", "type": "Crypto", "base_price": 7200.0, "vol": 0.04, "drift": 0.0008, "seed": 42},
    "NVDA": {"name": "NVIDIA", "type": "Equity", "base_price": 6.0, "vol": 0.028, "drift": 0.0012, "seed": 101},
    "GC=F": {"name": "Gold", "type": "Commodity", "base_price": 1520.0, "vol": 0.012, "drift": 0.0003, "seed": 202},
    "SPY": {"name": "S&P 500 ETF", "type": "Index ETF", "base_price": 320.0, "vol": 0.011, "drift": 0.0004, "seed": 303},
}

def fetch_yfinance_or_generate():
    import yfinance as yf
    
    dates = pd.date_range(start="2020-01-01", end="2026-09-01", freq="D")
    
    for symbol, info in ASSETS.items():
        csv_filename = symbol.replace("=", "_").replace("-", "_") + ".csv"
        filepath = os.path.join(SEED_DIR, csv_filename)
        
        df = None
        try:
            print(f"Attempting online fetch for {symbol} via yfinance...")
            ticker_data = yf.download(symbol, start="2020-01-01", end="2026-09-01", progress=False)
            if not ticker_data.empty and len(ticker_data) > 100:
                if isinstance(ticker_data.columns, pd.MultiIndex):
                    ticker_data.columns = ticker_data.columns.get_level_values(0)
                df = ticker_data[['Open', 'High', 'Low', 'Close', 'Volume']].dropna()
                df.index.name = "Date"
                df = df.reset_index()
                print(f"Successfully fetched {len(df)} bars for {symbol} online.")
        except Exception as e:
            print(f"yfinance fetch failed for {symbol}: {e}. Generating realistic seed dataset...")
            
        if df is None or df.empty:
            np.random.seed(info["seed"])
            n = len(dates)
            
            # Geometric Brownian Motion with regime shifts
            returns = np.random.normal(info["drift"], info["vol"], n)
            
            # Inject realistic historical shocks (e.g. Covid crash March 2020, Crypto bull 2021, Tech rally 2023-2024)
            for i, d in enumerate(dates):
                date_str = d.strftime("%Y-%m-%d")
                if "2020-02-20" <= date_str <= "2020-03-23": # Covid crash
                    returns[i] -= 0.02
                elif symbol == "BTC-USD" and "2020-10-01" <= date_str <= "2021-04-15": # BTC Bull run
                    returns[i] += 0.003
                elif symbol == "NVDA" and "2023-01-01" <= date_str <= "2024-06-01": # AI boom
                    returns[i] += 0.0025
                elif symbol == "BTC-USD" and "2022-01-01" <= date_str <= "2022-11-30": # Crypto bear
                    returns[i] -= 0.002

            price_path = info["base_price"] * np.cumprod(1 + returns)
            
            opens = price_path * (1 + np.random.uniform(-0.005, 0.005, n))
            highs = np.maximum(price_path, opens) * (1 + np.random.uniform(0.001, 0.015, n))
            lows = np.minimum(price_path, opens) * (1 - np.random.uniform(0.001, 0.015, n))
            closes = price_path
            volumes = np.random.exponential(1000000, n) * (price_path / info["base_price"])

            df = pd.DataFrame({
                "Date": dates.strftime("%Y-%m-%d"),
                "Open": np.round(opens, 4),
                "High": np.round(highs, 4),
                "Low": np.round(lows, 4),
                "Close": np.round(closes, 4),
                "Volume": np.round(volumes, 0)
            })

        df.to_csv(filepath, index=False)
        print(f"Saved seed data for {symbol} to {filepath}")

if __name__ == "__main__":
    fetch_yfinance_or_generate()

import os
import pandas as pd
import numpy as np
from app.core.config import settings

ASSET_MAP = {
    "BTC-USD": {"filename": "BTC_USD.csv", "name": "Bitcoin", "type": "Crypto"},
    "NVDA": {"filename": "NVDA.csv", "name": "NVIDIA", "type": "Equity"},
    "GC=F": {"filename": "GC_F.csv", "name": "Gold", "type": "Commodity"},
    "SPY": {"filename": "SPY.csv", "name": "S&P 500 ETF", "type": "Index ETF"}
}

def load_asset_data(symbol: str, start_date: str = None, end_date: str = None) -> pd.DataFrame:
    """
    Loads price data for a symbol. First tries yfinance (if network available),
    falls back to local seeded CSV files.
    """
    if symbol not in ASSET_MAP:
        raise ValueError(f"Unsupported asset symbol: {symbol}")

    df = None
    # 1. Try online fetch if internet is active
    try:
        import yfinance as yf
        ticker_data = yf.download(symbol, start=start_date or "2020-01-01", end=end_date or "2026-09-01", progress=False)
        if not ticker_data.empty and len(ticker_data) > 20:
            if isinstance(ticker_data.columns, pd.MultiIndex):
                ticker_data.columns = ticker_data.columns.get_level_values(0)
            df = ticker_data[['Open', 'High', 'Low', 'Close', 'Volume']].dropna().reset_index()
            df["Date"] = pd.to_datetime(df["Date"]).dt.strftime("%Y-%m-%d")
    except Exception:
        df = None

    # 2. Primary / Fallback: Load from local seeded CSV dataset
    if df is None or df.empty:
        filename = ASSET_MAP[symbol]["filename"]
        filepath = os.path.join(settings.SEED_DATA_DIR, filename)
        if os.path.exists(filepath):
            df = pd.read_csv(filepath)
            df["Date"] = pd.to_datetime(df["Date"]).dt.strftime("%Y-%m-%d")
        else:
            # Generate deterministic fallback if seed file doesn't exist yet
            dates = pd.date_range(start="2020-01-01", end="2026-09-01", freq="D")
            n = len(dates)
            np.random.seed(42 if symbol == "BTC-USD" else 101)
            base_price = 100.0
            ret = np.random.normal(0.0005, 0.02, n)
            prices = base_price * np.cumprod(1 + ret)
            df = pd.DataFrame({
                "Date": dates.strftime("%Y-%m-%d"),
                "Open": prices * 0.99,
                "High": prices * 1.01,
                "Low": prices * 0.98,
                "Close": prices,
                "Volume": 100000
            })

    # Apply date filters
    if start_date:
        df = df[df["Date"] >= start_date]
    if end_date:
        df = df[df["Date"] <= end_date]

    return df.reset_index(drop=True)

def get_available_assets() -> list[dict]:
    return [
        {"symbol": sym, "name": meta["name"], "type": meta["type"]}
        for sym, meta in ASSET_MAP.items()
    ]

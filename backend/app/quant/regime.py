import pandas as pd
import numpy as np

def detect_market_regimes(df: pd.DataFrame, trend_window: int = 50, vol_window: int = 20) -> pd.DataFrame:
    """
    Classifies daily market environment into 4 distinct regimes:
    1. Bull Market (Price > SMA and positive momentum)
    2. Bear Market (Price < SMA and negative momentum)
    3. High Volatility (Rolling volatility in top 25th percentile)
    4. Low Volatility (Rolling volatility in bottom 25th percentile)
    """
    df_regime = df.copy()
    close = df_regime["Close"]
    
    # 1. Trend indicator
    sma_trend = close.rolling(window=trend_window, min_periods=1).mean()
    daily_ret = close.pct_change().fillna(0.0)
    
    # 2. Rolling volatility (annualized)
    rolling_vol = daily_ret.rolling(window=vol_window, min_periods=5).std() * np.sqrt(252)
    rolling_vol = rolling_vol.fillna(0.0)
    
    vol_75 = rolling_vol.quantile(0.75)
    vol_25 = rolling_vol.quantile(0.25)
    
    regimes = []
    regime_colors = []
    
    for c, s, v in zip(close, sma_trend, rolling_vol):
        if v >= vol_75 and vol_75 > 0:
            regimes.append("High Volatility")
            regime_colors.append("#ef4444") # Red
        elif v <= vol_25 and v > 0:
            regimes.append("Low Volatility")
            regime_colors.append("#3b82f6") # Blue
        elif c >= s:
            regimes.append("Bull Market")
            regime_colors.append("#10b981") # Emerald Green
        else:
            regimes.append("Bear Market")
            regime_colors.append("#f59e0b") # Amber Yellow
            
    df_regime["Regime"] = regimes
    df_regime["RegimeColor"] = regime_colors
    df_regime["RollingVol"] = rolling_vol.round(4)
    
    return df_regime

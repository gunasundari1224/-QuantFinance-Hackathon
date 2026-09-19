import pandas as pd
import numpy as np
from app.quant.indicators import calculate_sma, calculate_ema

def generate_sma_crossover_signals(df: pd.DataFrame, fast_period: int = 10, slow_period: int = 50) -> pd.Series:
    """
    SMA Crossover Strategy:
    Long (+1) when Fast SMA > Slow SMA
    Cash/Flat (0) when Fast SMA <= Slow SMA
    """
    close = df["Close"]
    fast_sma = calculate_sma(close, fast_period)
    slow_sma = calculate_sma(close, slow_period)
    
    signals = pd.Series(0.0, index=df.index)
    signals[fast_sma > slow_sma] = 1.0
    return signals

def generate_ema_trend_signals(df: pd.DataFrame, fast_period: int = 12, slow_period: int = 26) -> pd.Series:
    """
    EMA Trend Strategy:
    Long (+1) when Fast EMA > Slow EMA and EMA slope is positive
    """
    close = df["Close"]
    fast_ema = calculate_ema(close, fast_period)
    slow_ema = calculate_ema(close, slow_period)
    
    signals = pd.Series(0.0, index=df.index)
    trend_filter = fast_ema > slow_ema
    slope = fast_ema.diff() > 0
    signals[trend_filter & slope] = 1.0
    return signals

def generate_momentum_signals(df: pd.DataFrame, lookback_period: int = 20, threshold_pct: float = 0.02) -> pd.Series:
    """
    Momentum Strategy:
    Long (+1) if price N days ago returns > threshold_pct
    Cash (0) otherwise
    """
    close = df["Close"]
    momentum = close.pct_change(periods=lookback_period).fillna(0.0)
    
    signals = pd.Series(0.0, index=df.index)
    signals[momentum > threshold_pct] = 1.0
    return signals

def generate_mean_reversion_signals(df: pd.DataFrame, lookback_period: int = 20, z_threshold: float = 1.5) -> pd.Series:
    """
    Mean Reversion Strategy (Z-Score of Price vs SMA):
    Long (+1) when Price is oversold (Z-score < -z_threshold)
    Exit (0) when Price returns to mean (Z-score >= 0)
    """
    close = df["Close"]
    sma = calculate_sma(close, lookback_period)
    std = close.rolling(window=lookback_period, min_periods=1).std().fillna(1.0)
    std[std == 0] = 1.0
    
    z_score = (close - sma) / std
    
    signals = pd.Series(0.0, index=df.index)
    in_position = False
    
    # State tracking loop to enter on oversold and exit when crossing mean
    signals_list = []
    for z in z_score:
        if z < -z_threshold:
            in_position = True
        elif z >= 0.0:
            in_position = False
            
        signals_list.append(1.0 if in_position else 0.0)
        
    return pd.Series(signals_list, index=df.index)

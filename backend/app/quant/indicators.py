import pandas as pd
import numpy as np

def calculate_sma(series: pd.Series, period: int = 20) -> pd.Series:
    """
    Calculates Simple Moving Average (SMA).
    """
    return series.rolling(window=period, min_periods=1).mean()

def calculate_ema(series: pd.Series, period: int = 20) -> pd.Series:
    """
    Calculates Exponential Moving Average (EMA).
    """
    return series.ewm(span=period, adjust=False, min_periods=1).mean()

import pandas as pd
import numpy as np

def calculate_daily_returns(series: pd.Series) -> pd.Series:
    """
    Calculates percentage daily returns: (P_t - P_{t-1}) / P_{t-1}
    """
    return series.pct_change().fillna(0.0)

def calculate_cumulative_returns(daily_returns: pd.Series) -> pd.Series:
    """
    Calculates cumulative returns growth factor: prod(1 + R_i) - 1
    """
    return (1.0 + daily_returns).cumprod() - 1.0

def calculate_rolling_returns(series: pd.Series, window: int = 30) -> pd.Series:
    """
    Calculates rolling window percentage returns over N days.
    """
    return series.pct_change(periods=window).fillna(0.0)

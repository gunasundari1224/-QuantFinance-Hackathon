import pandas as pd
import numpy as np

def calculate_correlation_matrix(asset_returns_df: pd.DataFrame) -> dict:
    """
    Computes Pearson correlation matrix across multi-asset return series.
    Returns structured dict with labels and 2D correlation matrix values.
    """
    if asset_returns_df.empty:
        return {"symbols": [], "matrix": []}

    corr_df = asset_returns_df.corr(method="pearson").fillna(0.0)
    symbols = list(corr_df.columns)
    matrix = corr_df.values.round(4).tolist()

    return {
        "symbols": symbols,
        "matrix": matrix
    }

def calculate_rolling_correlation(returns_a: pd.Series, returns_b: pd.Series, window: int = 30) -> pd.Series:
    """
    Computes rolling N-day Pearson correlation between two asset return series.
    """
    rolling_corr = returns_a.rolling(window=window, min_periods=5).corr(returns_b).fillna(0.0)
    return rolling_corr

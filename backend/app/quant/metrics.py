import pandas as pd
import numpy as np

def calculate_annualized_volatility(daily_returns: pd.Series, trading_days: int = 252) -> float:
    """
    Calculates annualized volatility (std * sqrt(252)).
    """
    if len(daily_returns) < 2:
        return 0.0
    vol = daily_returns.std() * np.sqrt(trading_days)
    return float(vol) if not np.isnan(vol) else 0.0

def calculate_sharpe_ratio(daily_returns: pd.Series, risk_free_rate: float = 0.04, trading_days: int = 252) -> float:
    """
    Calculates annualized Sharpe Ratio: (E[R] - R_f) / std(R) * sqrt(252)
    """
    if len(daily_returns) < 2:
        return 0.0
    daily_rf = risk_free_rate / trading_days
    excess_returns = daily_returns - daily_rf
    mean_excess = excess_returns.mean()
    std_returns = daily_returns.std()
    
    if std_returns <= 1e-8 or np.isnan(std_returns):
        return 0.0
    
    sharpe = (mean_excess / std_returns) * np.sqrt(trading_days)
    return float(sharpe) if not np.isnan(sharpe) else 0.0

def calculate_max_drawdown(price_or_equity_series: pd.Series) -> tuple[float, pd.Series]:
    """
    Calculates maximum drawdown percentage and full drawdown time series.
    MDD = (Peak - Current) / Peak
    """
    if len(price_or_equity_series) == 0:
        return 0.0, pd.Series(dtype=float)

    cumulative_max = price_or_equity_series.cummax()
    drawdown = (price_or_equity_series - cumulative_max) / cumulative_max
    max_dd = abs(float(drawdown.min())) if len(drawdown) > 0 else 0.0
    return max_dd, drawdown

def calculate_cagr(price_series: pd.Series, trading_days: int = 252) -> float:
    """
    Calculates Compound Annual Growth Rate (CAGR).
    """
    if len(price_series) < 2:
        return 0.0
    start_val = price_series.iloc[0]
    end_val = price_series.iloc[-1]
    n_years = len(price_series) / trading_days
    
    if start_val <= 0 or n_years <= 0:
        return 0.0
    
    cagr = (end_val / start_val) ** (1.0 / n_years) - 1.0
    return float(cagr) if not np.isnan(cagr) else 0.0
